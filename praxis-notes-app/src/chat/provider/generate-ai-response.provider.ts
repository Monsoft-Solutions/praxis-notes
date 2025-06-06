import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';
import { chatMessageTable } from '../db';

import {
    OptimizedContextSelectionResult,
    UserBasicDataForChat,
    ChatMessage,
} from '../schemas';

import { generateChatResponseImproved } from '../utils/generate-chat-response-improved.util';
import { streamMessageUpdate } from '../utils/batch-update-manager.util';
import { countTokens, calculateMessageImportance } from '../utils';

import { AiGenerationQualitySelector } from '@src/ai/schemas';
import { logger } from '@logger/providers';

export type GenerateAiResponseInput = {
    contextResult: OptimizedContextSelectionResult;
    userBasicData: UserBasicDataForChat;
    chatSessionId: string;
    model: AiGenerationQualitySelector;
    assistantMessageId: string;
    allMessages: ChatMessage[];
};

export type GenerateAiResponseResult = {
    fullResponseContent: string;
    tokenCount: number;
    importanceScore: number;
};

/**
 * Generate AI response using optimized context and handle streaming updates
 */
export const generateAiResponse = async ({
    contextResult,
    userBasicData,
    chatSessionId,
    model,
    assistantMessageId,
    allMessages,
}: GenerateAiResponseInput) => {
    // Generate AI response using the optimized context
    const { data: responseStream, error: aiResponseError } =
        await generateChatResponseImproved({
            contextResult,
            userBasicData,
            chatSessionId,
            model,
        });

    if (aiResponseError) return Error();

    let fullResponseContent = '';

    // Process streaming response with batched updates
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
        const { done, value: textDelta } = await responseStream.read();

        if (done) break;

        fullResponseContent += textDelta;

        // Use batched update for streaming
        const { error: streamError } = await streamMessageUpdate({
            messageId: assistantMessageId,
            sessionId: chatSessionId,
            content: textDelta,
            isComplete: false,
        });

        if (streamError) {
            logger.error('Stream update failed', {
                sessionId: chatSessionId,
                messageId: assistantMessageId,
                error: streamError,
            });
            return Error();
        }
    }

    // Complete the stream and perform final updates
    const { error: finalStreamError } = await streamMessageUpdate({
        messageId: assistantMessageId,
        sessionId: chatSessionId,
        content: '',
        isComplete: true,
    });

    if (finalStreamError) {
        logger.error('Final stream completion failed', {
            sessionId: chatSessionId,
            messageId: assistantMessageId,
            error: finalStreamError,
        });
        return Error();
    }

    // Calculate final metadata for the assistant message
    const { data: assistantTokens } = countTokens({
        text: fullResponseContent,
    });

    const completedAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        sessionId: chatSessionId,
        content: fullResponseContent,
        role: 'assistant',
        createdAt: Date.now(),
        attachments: [],
    };

    const { data: assistantImportanceResult } = calculateMessageImportance({
        message: completedAssistantMessage,
        allMessages: [...allMessages, completedAssistantMessage],
    });

    // Update assistant message with final metadata
    await catchError(
        db
            .update(chatMessageTable)
            .set({
                tokenCount: assistantTokens,
                importanceScore: assistantImportanceResult.score,
            })
            .where(eq(chatMessageTable.id, assistantMessageId)),
    );

    return Success({
        fullResponseContent,
        tokenCount: assistantTokens,
        importanceScore: assistantImportanceResult.score,
    });
};
