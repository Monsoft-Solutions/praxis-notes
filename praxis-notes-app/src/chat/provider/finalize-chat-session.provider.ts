import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';
import { chatSessionTable } from '../db';

import {
    UserBasicDataForChat,
    OptimizedContextSelectionResult,
} from '../schemas';
import { generateChatSessionTitle } from '../utils/generate-chat-session-title.util';
import { autoSummarizeIfNeeded } from '../utils';

import { emit } from '@events/providers';
import { logger } from '@logger/providers';

export type FinalizeSessionInput = {
    sessionId: string;
    isFirstMessage: boolean;
    firstMessageContent?: string;
    userBasicData: UserBasicDataForChat;
    contextResult: OptimizedContextSelectionResult;
    messageMetrics: {
        userTokenCount: number;
        assistantTokenCount: number;
        userImportanceScore: number;
        assistantImportanceScore: number;
    };
};

export type FinalizeSessionResult = {
    title?: string;
};

/**
 * Finalize chat session by generating title (if first message),
 * updating session metadata, and triggering auto-summarization
 */
export const finalizeChatSession = async ({
    sessionId,
    isFirstMessage,
    firstMessageContent,
    userBasicData,
    contextResult,
    messageMetrics,
}: FinalizeSessionInput) => {
    let title: string | undefined = undefined;

    // Generate title for new conversations
    if (isFirstMessage && firstMessageContent) {
        const { data: generatedTitle, error: generatedTitleError } =
            await generateChatSessionTitle({
                firstMessage: firstMessageContent,
                userBasicData,
                chatSessionId: sessionId,
            });

        if (generatedTitleError) return Error();

        title = generatedTitle;

        emit({
            event: 'chatSessionTitleUpdated',
            payload: {
                id: sessionId,
                title,
            },
        });
    }

    // Update session's updatedAt timestamp and title
    await catchError(
        db
            .update(chatSessionTable)
            .set({
                updatedAt: Date.now(),
                ...(title && { title }),
            })
            .where(eq(chatSessionTable.id, sessionId)),
    );

    // Log completion metrics with optimization details
    logger.info('Chat message completed with optimization', {
        sessionId,
        userMessageTokens: messageMetrics.userTokenCount,
        assistantMessageTokens: messageMetrics.assistantTokenCount,
        userImportanceScore: messageMetrics.userImportanceScore,
        assistantImportanceScore: messageMetrics.assistantImportanceScore,
        optimizationUsed: contextResult.optimizationUsed,
        tokensSavedBySummaries: contextResult.tokensSavedBySummaries,
        selectionStrategy: contextResult.selectionStrategy,
    });

    // Trigger auto-summarization if needed (fire and forget)
    void autoSummarizeIfNeeded({
        sessionId,
        contextResult,
        userBasicData: {
            userId: userBasicData.userId,
        },
    });

    return Success({ title });
};
