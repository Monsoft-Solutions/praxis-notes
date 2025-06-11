import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { eq, asc, gt, and, ne, isNotNull, count } from 'drizzle-orm';

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

// File schema for typed attachments
import type { File } from '@shared/schemas';

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
    const startTime = performance.now();
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

    // ------------------------------------------------------------
    // Batch-fetch attachments (drastically reduces DB round-trips)
    // ------------------------------------------------------------
    // 1️⃣ collect every unique fileId referenced in this slice of messages
    const uniqueFileIds = new Set<string>();
    rawMessages.forEach(({ attachments }) => {
        attachments.forEach(({ fileId }) => uniqueFileIds.add(fileId));
    });

    // 2️⃣ fetch each file concurrently *once*
    const fileResults = await Promise.all(
        Array.from(uniqueFileIds).map(async (fileId) => {
            const { data: file } = await getFileById({ id: fileId });
            return { fileId, file } as const;
        }),
    );

    // 3️⃣ create a fast lookup map <fileId, File>
    const fileMap = new Map<string, File>();
    fileResults.forEach(({ fileId, file }) => {
        if (file) fileMap.set(fileId, file);
    });

    // 4️⃣ hydrate messages with their full attachments in-memory (no extra I/O)
    const messages = rawMessages.map(
        ({ attachments: rawAttachments, ...message }) => ({
            ...message,
            attachments: rawAttachments
                .map(({ fileId }) => fileMap.get(fileId))
                .filter((item): item is File => item !== undefined),
        }),
    );

    // Calculate how many messages were covered by summaries (only if metadata requested)
    let messagesCoveredBySummaries = 0;

    if (calculateMetadata) {
        const { data: totalMessagesRows, error: countError } = await catchError(
            db
                .select({ count: count() })
                .from(chatMessageTable)
                .where(eq(chatMessageTable.sessionId, sessionId)),
        );

        const totalMessages = countError
            ? 0
            : (totalMessagesRows.at(0)?.count ?? 0);
        messagesCoveredBySummaries = Math.max(
            0,
            totalMessages - messages.length,
        );
    }

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

    const endTime = performance.now();
    console.log(
        `Time taken to get context: ${endTime - startTime} milliseconds`,
    );

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
    preloadedSession,
}: {
    sessionId: string;
    model?: AiModelName;
    forceIncludeRecent?: number;
    allMessages?: ChatMessage[]; // Pass existing messages if available to avoid extra DB calls
    preloadedSession?: ChatSessionWithOptimalContext; // NEW: accept an already-loaded session to skip I/O
}) => {
    // If a session is already provided, use it. Otherwise, load it from the DB.
    const chatSessionResult = preloadedSession
        ? Success(preloadedSession)
        : await getChatSessionWithOptimalContext({
              sessionId,
              model,
              calculateMetadata: true,
          });

    const { data: chatSession, error: chatSessionError } = chatSessionResult;

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
        preloadedSession?: ChatSessionWithOptimalContext;
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

    // ------------------------------------------------------------
    // Batch-fetch attachments for fallback mode
    // ------------------------------------------------------------
    const uniqueFallbackFileIds = new Set<string>();
    rawMessages.forEach(({ attachments }) => {
        attachments.forEach(({ fileId }) => uniqueFallbackFileIds.add(fileId));
    });

    const fallbackFileResults = await Promise.all(
        Array.from(uniqueFallbackFileIds).map(async (fileId) => {
            const { data: file } = await getFileById({ id: fileId });
            return { fileId, file } as const;
        }),
    );

    const fallbackFileMap = new Map<string, File>();
    fallbackFileResults.forEach(({ fileId, file }) => {
        if (file) fallbackFileMap.set(fileId, file);
    });

    const messages = rawMessages.map(
        ({ attachments: rawAttachments, ...message }) => ({
            ...message,
            attachments: rawAttachments
                .map(({ fileId }) => fallbackFileMap.get(fileId))
                .filter((item): item is File => item !== undefined),
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
