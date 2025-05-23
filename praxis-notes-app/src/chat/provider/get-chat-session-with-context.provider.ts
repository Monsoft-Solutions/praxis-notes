import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { eq, asc } from 'drizzle-orm';

import { chatSessionTable, chatMessageTable } from '../db';

import { getFileById } from '@src/fs/providers/servers/get-file-by-id.provider';

import { ChatSession, ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';
import {
    countTokens,
    calculateContextUtilization,
    getRecommendedContextLimit,
} from '../utils/token-counter.util';
import { calculateMessageImportance } from '../utils/message-importance-scorer.util';

export type ContextMetadata = {
    totalMessages: number;
    totalTokens: number;
    averageImportanceScore: number;
    contextUtilization: number;
    hasLongConversation: boolean;
    recommendsSummarization: boolean;
    tokenLimit: number;
    messagesAnalyzed: number;
};

export type ChatSessionWithContext = ChatSession & {
    contextMetadata: ContextMetadata;
};

/**
 * Get chat session with context metadata and smart context analysis
 */
export const getChatSessionWithContext = (async ({
    sessionId,
    model = 'claude-3-5-haiku-latest',
    calculateMetadata = true,
    previewMode = false,
    maxPreviewMessages = 20,
}: {
    sessionId: string;
    model?: AiModelName;
    calculateMetadata?: boolean;
    previewMode?: boolean;
    maxPreviewMessages?: number;
}) => {
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                with: {
                    messages: {
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

    // Calculate context metadata if requested
    let contextMetadata: ContextMetadata = {
        totalMessages: messages.length,
        totalTokens: 0,
        averageImportanceScore: 0,
        contextUtilization: 0,
        hasLongConversation: false,
        recommendsSummarization: false,
        tokenLimit: 0,
        messagesAnalyzed: messages.length,
    };

    if (calculateMetadata) {
        contextMetadata = calculateContextMetadata({
            messages,
            model,
        });
    }

    const chatSession: ChatSessionWithContext = {
        ...rawChatSession,
        messages,
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
    },
    ChatSessionWithContext
>;

/**
 * Calculate context metadata for a conversation
 */
function calculateContextMetadata({
    messages,
    model,
}: {
    messages: ChatMessage[];
    model: AiModelName;
}): ContextMetadata {
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

    const averageImportanceScore =
        messagesWithScores > 0
            ? Math.round((totalImportanceScore / messagesWithScores) * 100) /
              100
            : 0;

    const { data: contextUtilization } = calculateContextUtilization({
        tokenCount: totalTokens,
        model,
    });

    // Determine if conversation is long or needs summarization
    const hasLongConversation = messages.length > 50 || totalTokens > 50000;
    const recommendsSummarization =
        messages.length > 100 || totalTokens > actualTokenLimit * 0.8;

    return {
        totalMessages: messages.length,
        totalTokens,
        averageImportanceScore,
        contextUtilization: contextUtilization ?? 0,
        hasLongConversation,
        recommendsSummarization,
        tokenLimit: actualTokenLimit,
        messagesAnalyzed: messagesWithScores,
    };
}
