import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { eq, asc, gt, and, ne, isNotNull } from 'drizzle-orm';

import { chatSessionTable, chatMessageTable } from '../db';
import {
    getSessionSummaries,
    ConversationSummary,
} from '../utils/conversation-summarizer.util';

import { getFileById } from '@src/fs/providers/servers/get-file-by-id.provider';

import { ChatSession, ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';
import {
    countTokens,
    calculateContextUtilization,
    getRecommendedContextLimit,
} from '../utils/token-counter.util';
import { calculateMessageImportance } from '../utils/message-importance-scorer.util';

// Add import for OptimizedContextSelectionResult
import { OptimizedContextSelectionResult } from '../schemas';
import { selectOptimalContextOptimized } from '../utils/smart-context-manager-optimized.util';

export type OptimalContextMetadata = {
    totalMessages: number;
    totalTokens: number;
    averageImportanceScore: number;
    contextUtilization: number;
    hasLongConversation: boolean;
    recommendsSummarization: boolean;
    tokenLimit: number;
    messagesAnalyzed: number;
    // New fields for summary optimization
    totalSummaries: number;
    latestSummaryTimestamp: number | null;
    messagesCoveredBySummaries: number;
    tokensSavedBySummaries: number;
    optimizationUsed: boolean;
};

export type ChatSessionWithOptimalContext = ChatSession & {
    contextMetadata: OptimalContextMetadata;
    summaries: ConversationSummary[];
    contextResult?: OptimizedContextSelectionResult;
};

/**
 * Get chat session with optimal context - only loads messages not covered by summaries
 * Plus all available summaries for efficient context management
 */
export const getChatSessionWithOptimalContext = (async ({
    sessionId,
    model = 'claude-3-5-haiku-latest',
    calculateMetadata = true,
    previewMode = false,
    maxPreviewMessages = 20,
    forceLoadAllMessages = false, // For backward compatibility
}: {
    sessionId: string;
    model?: AiModelName;
    calculateMetadata?: boolean;
    previewMode?: boolean;
    maxPreviewMessages?: number;
    forceLoadAllMessages?: boolean;
}) => {
    // Load session summaries first
    const { data: summaries, error: summariesError } =
        await getSessionSummaries({
            sessionId,
        });

    // If we can't load summaries or force loading all messages, fall back to old behavior
    if (summariesError || forceLoadAllMessages || summaries.length === 0) {
        return await getFallbackSession({
            sessionId,
            model,
            calculateMetadata,
            previewMode,
            maxPreviewMessages,
            summaries: summaries ?? [],
        });
    }

    // Find the latest summary timestamp to determine which messages to load
    const latestSummaryTimestamp = Math.max(
        ...summaries.map((s) => s.toTimestamp),
    );

    // Load only the session metadata first
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                // with: {
                //     messages: {
                //         where: and(
                //             isNotNull(chatMessageTable.content),
                //             ne(chatMessageTable.content, ''),
                //         ),
                //         orderBy: asc(chatMessageTable.createdAt),
                //         limit: previewMode ? maxPreviewMessages : undefined,
                //         with: {
                //             attachments: true,
                //         },
                //     },
                // },
            }),
        );

    if (rawChatSessionError) return Error();
    if (!rawChatSession) return Error();

    // Load only messages that come after the latest summary
    const { data: rawMessages, error: messagesError } = await catchError(
        db.query.chatMessageTable.findMany({
            where: and(
                gt(chatMessageTable.createdAt, latestSummaryTimestamp),
                isNotNull(chatMessageTable.content),
                ne(chatMessageTable.content, ''),
            ),
            orderBy: asc(chatMessageTable.createdAt),
            limit: previewMode ? maxPreviewMessages : undefined,
            with: {
                attachments: true,
            },
        }),
    );

    if (messagesError) return Error();

    // Load attachments for messages
    const messages = await Promise.all(
        rawMessages.map(async ({ attachments: rawAttachments, ...message }) => {
            const attachments = (
                await Promise.all(
                    rawAttachments.map(async ({ fileId }) => {
                        const { data: file, error: fileError } =
                            await getFileById({
                                id: fileId,
                            });

                        if (fileError) return null;

                        return file;
                    }),
                )
            ).filter((item) => item !== null);

            return {
                ...message,
                attachments,
            };
        }),
    );

    // Calculate how many messages were covered by summaries
    const { data: totalMessageCount, error: countError } = await catchError(
        db.query.chatMessageTable.findMany({
            where: eq(chatMessageTable.sessionId, sessionId),
            columns: { id: true },
        }),
    );

    const messagesCoveredBySummaries = countError
        ? 0
        : Math.max(0, totalMessageCount.length - messages.length);

    // Calculate tokens saved by summaries
    const tokensSavedBySummaries = summaries.reduce(
        (total, summary) =>
            total + (summary.originalTokenCount - summary.summaryTokenCount),
        0,
    );

    // Calculate context metadata if requested
    let contextMetadata: OptimalContextMetadata = {
        totalMessages: messages.length,
        totalTokens: 0,
        averageImportanceScore: 0,
        contextUtilization: 0,
        hasLongConversation: false,
        recommendsSummarization: false,
        tokenLimit: 0,
        messagesAnalyzed: messages.length,
        totalSummaries: summaries.length,
        latestSummaryTimestamp,
        messagesCoveredBySummaries,
        tokensSavedBySummaries,
        optimizationUsed: true,
    };

    if (calculateMetadata) {
        contextMetadata = calculateOptimalContextMetadata({
            messages,
            summaries,
            model,
            messagesCoveredBySummaries,
            tokensSavedBySummaries,
            latestSummaryTimestamp,
        });
    }

    const chatSession: ChatSessionWithOptimalContext = {
        ...rawChatSession,
        messages,
        summaries,
        contextMetadata,
    };

    return Success(chatSession);
}) satisfies Function<
    {
        sessionId: string;
        model?: AiModelName;
        calculateMetadata?: boolean;
        previewMode?: boolean;
        maxPreviewMessages?: number;
        forceLoadAllMessages?: boolean;
    },
    ChatSessionWithOptimalContext
>;

/**
 * Enhanced version that combines session loading with optimal context selection
 * This eliminates the need for separate getChatSessionWithOptimalContext + selectOptimalContextOptimized calls
 */
export const getChatSessionWithContextSelected = (async ({
    sessionId,
    model = 'claude-3-5-haiku-latest',
    forceIncludeRecent = 3,
    allMessages = [],
}: {
    sessionId: string;
    model?: AiModelName;
    forceIncludeRecent?: number;
    allMessages?: ChatMessage[]; // Pass existing messages if available to avoid extra DB calls
}) => {
    // First, get the optimal context (messages + summaries)
    const { data: chatSession, error: chatSessionError } =
        await getChatSessionWithOptimalContext({
            sessionId,
            model,
            calculateMetadata: true,
        });

    if (chatSessionError) return Error();

    const { messages, summaries, contextMetadata } = chatSession;

    // Use the messages passed in (which includes the new user message) or the loaded ones
    const messagesToProcess = allMessages.length > 0 ? allMessages : messages;

    const { data: contextResult, error: contextError } =
        selectOptimalContextOptimized({
            messages: messagesToProcess,
            summaries,
            model,
            forceIncludeRecent,
            tokensSavedBySummaries: contextMetadata.tokensSavedBySummaries,
        });

    if (contextError) return Error();

    const enhancedChatSession: ChatSessionWithOptimalContext = {
        ...chatSession,
        messages: messagesToProcess,
        contextResult,
    };

    return Success(enhancedChatSession);
}) satisfies Function<
    {
        sessionId: string;
        model?: AiModelName;
        forceIncludeRecent?: number;
        allMessages?: ChatMessage[];
    },
    ChatSessionWithOptimalContext
>;

/**
 * Fallback to old behavior when summaries aren't available
 */
async function getFallbackSession({
    sessionId,
    model,
    calculateMetadata,
    previewMode,
    maxPreviewMessages,
    summaries,
}: {
    sessionId: string;
    model: AiModelName;
    calculateMetadata: boolean;
    previewMode: boolean;
    maxPreviewMessages: number;
    summaries: ConversationSummary[];
}) {
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                with: {
                    messages: {
                        where: and(
                            isNotNull(chatMessageTable.content),
                            ne(chatMessageTable.content, ''),
                        ),
                        orderBy: asc(chatMessageTable.createdAt),
                        limit: previewMode ? maxPreviewMessages : undefined,
                        with: {
                            attachments: true,
                        },
                    },
                },
            }),
        );

    if (rawChatSessionError) return Error();
    if (!rawChatSession) return Error();

    const { messages: rawMessages } = rawChatSession;

    // Load attachments for messages
    const messages = await Promise.all(
        rawMessages.map(async ({ attachments: rawAttachments, ...message }) => {
            const attachments = (
                await Promise.all(
                    rawAttachments.map(async ({ fileId }) => {
                        const { data: file, error: fileError } =
                            await getFileById({
                                id: fileId,
                            });

                        if (fileError) return null;

                        return file;
                    }),
                )
            ).filter((item) => item !== null);

            return {
                ...message,
                attachments,
            };
        }),
    );

    // Calculate context metadata
    let contextMetadata: OptimalContextMetadata = {
        totalMessages: messages.length,
        totalTokens: 0,
        averageImportanceScore: 0,
        contextUtilization: 0,
        hasLongConversation: false,
        recommendsSummarization: false,
        tokenLimit: 0,
        messagesAnalyzed: messages.length,
        totalSummaries: summaries.length,
        latestSummaryTimestamp: null,
        messagesCoveredBySummaries: 0,
        tokensSavedBySummaries: 0,
        optimizationUsed: false,
    };

    if (calculateMetadata) {
        contextMetadata = calculateOptimalContextMetadata({
            messages,
            summaries,
            model,
            messagesCoveredBySummaries: 0,
            tokensSavedBySummaries: 0,
            latestSummaryTimestamp: null,
        });
    }

    const chatSession: ChatSessionWithOptimalContext = {
        ...rawChatSession,
        messages,
        summaries,
        contextMetadata,
    };

    return Success(chatSession);
}

/**
 * Calculate optimal context metadata including summary optimization data
 */
function calculateOptimalContextMetadata({
    messages,
    summaries,
    model,
    messagesCoveredBySummaries,
    tokensSavedBySummaries,
    latestSummaryTimestamp,
}: {
    messages: ChatMessage[];
    summaries: ConversationSummary[];
    model: AiModelName;
    messagesCoveredBySummaries: number;
    tokensSavedBySummaries: number;
    latestSummaryTimestamp: number | null;
}): OptimalContextMetadata {
    const { data: tokenLimit, error: tokenLimitError } =
        getRecommendedContextLimit({ model });

    // If we can't get token limit, use a default
    const actualTokenLimit = tokenLimitError ? 100000 : tokenLimit;

    // Calculate token counts and importance scores
    let totalTokens = 0;
    let totalImportanceScore = 0;
    let messagesWithScores = 0;

    for (const message of messages) {
        // Calculate token count
        const { data: tokenCount } = countTokens({ text: message.content });
        totalTokens += tokenCount;

        // Calculate importance score
        const { data: importanceResult } = calculateMessageImportance({
            message,
            allMessages: messages,
        });

        totalImportanceScore += importanceResult.score;
        messagesWithScores++;
    }

    // Add summary tokens to total
    const summaryTokens = summaries.reduce(
        (total, summary) => total + summary.summaryTokenCount,
        0,
    );
    const totalContextTokens = totalTokens + summaryTokens;

    const averageImportanceScore =
        messagesWithScores > 0
            ? Math.round((totalImportanceScore / messagesWithScores) * 100) /
              100
            : 0;

    const { data: contextUtilization } = calculateContextUtilization({
        tokenCount: totalContextTokens,
        model,
    });

    // Adjust thresholds considering we only loaded uncovered messages
    const effectiveMessageCount = messages.length + messagesCoveredBySummaries;
    const hasLongConversation =
        effectiveMessageCount > 50 || totalContextTokens > 50000;
    const recommendsSummarization =
        effectiveMessageCount > 100 ||
        totalContextTokens > actualTokenLimit * 0.8;

    return {
        totalMessages: messages.length,
        totalTokens: totalContextTokens,
        averageImportanceScore,
        contextUtilization: contextUtilization ?? 0,
        hasLongConversation,
        recommendsSummarization,
        tokenLimit: actualTokenLimit,
        messagesAnalyzed: messagesWithScores,
        totalSummaries: summaries.length,
        latestSummaryTimestamp,
        messagesCoveredBySummaries,
        tokensSavedBySummaries,
        optimizationUsed: true,
    };
}
