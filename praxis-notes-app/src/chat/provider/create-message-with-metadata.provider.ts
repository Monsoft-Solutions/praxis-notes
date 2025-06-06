import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@db/providers/server';
import { chatMessageTable } from '../db';

import { ChatMessage } from '../schemas';

import { countTokens, calculateMessageImportance } from '../utils';

import { saveMessageAttachment } from './save-message-attachment.provider';
import { emit } from '@events/providers';

export type CreateMessageInput = {
    messageId?: string;
    content: string;
    attachments: { type: string; name: string; base64: string }[];
    sessionId: string;
    role: 'user' | 'assistant';
    allMessages: ChatMessage[];
};

export type CreateMessageResult = {
    message: ChatMessage;
    tokenCount: number;
    importanceScore: number;
};

/**
 * Create a message with calculated metadata (tokens, importance score)
 * and save it to the database
 */
export const createMessageWithMetadata = async ({
    content,
    attachments,
    sessionId,
    role,
    allMessages,
    messageId: messageIdInput,
}: CreateMessageInput) => {
    const messageId = messageIdInput ?? uuidv4();
    const now = Date.now();

    // Calculate metadata for the message
    const { data: tokenCount } = countTokens({ text: content });

    // Create the message
    const message: ChatMessage = {
        id: messageId,
        sessionId,
        content,
        role,
        createdAt: now,
        attachments,
    };

    // Calculate importance score
    const { data: importanceResult } = calculateMessageImportance({
        message,
        allMessages: [...allMessages, message],
    });

    // Insert message with metadata
    const { error: insertError } = await catchError(
        db.insert(chatMessageTable).values({
            ...message,
            tokenCount,
            importanceScore: importanceResult.score,
        }),
    );

    if (insertError) return Error();

    // Save attachments in parallel
    if (attachments.length > 0) {
        await Promise.all(
            attachments.map((attachment) =>
                saveMessageAttachment({
                    messageId,
                    file: attachment,
                }),
            ),
        );
    }

    // Emit event for the message
    emit({
        event: 'chatMessageCreated',
        payload: message,
    });

    return Success({
        message,
        tokenCount,
        importanceScore: importanceResult.score,
    });
};
