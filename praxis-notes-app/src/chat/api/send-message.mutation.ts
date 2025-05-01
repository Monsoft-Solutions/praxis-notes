import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { emit } from '@events/providers';

import { v4 as uuidv4 } from 'uuid';

import { chatSessionTable, chatMessageTable } from '../db';

import { ChatMessage, createChatMessageSchema } from '../schemas';
import { generateChatResponse } from '../utils/generate-chat-response.util';
import { generateChatSessionTitle } from '../utils/generate-chat-session-title.util';
export const sendMessage = protectedEndpoint
    .input(createChatMessageSchema)
    .mutation(
        queryMutationCallback(async ({ input: { content, sessionId } }) => {
            // Get previous messages for context
            const { data: previousMessages, error: previousMessagesError } =
                await catchError(
                    db.query.chatMessageTable.findMany({
                        where: eq(chatMessageTable.sessionId, sessionId),
                        orderBy: chatMessageTable.createdAt,
                    }),
                );

            if (previousMessagesError) return Error();

            // current timestamp
            const now = Date.now();

            // Create the user message
            const userMessage: ChatMessage = {
                id: uuidv4(),
                sessionId,
                content,
                role: 'user',
                createdAt: now,
            };

            // Insert user message
            const { error: userMessageError } = await catchError(
                db.insert(chatMessageTable).values(userMessage),
            );

            if (userMessageError) return Error();

            // Emit event for the user message
            emit({
                event: 'chatMessageCreated',
                payload: userMessage,
            });

            const allMessages = [...previousMessages, userMessage];

            // Generate AI response
            const { data: aiResponse, error: aiResponseError } =
                await generateChatResponse({
                    messages: allMessages,
                });

            if (aiResponseError) return Error();

            // Create the assistant message
            const assistantMessage: ChatMessage = {
                id: uuidv4(),
                sessionId,
                content: aiResponse,
                role: 'assistant',
                createdAt: Date.now(),
            };

            // Insert assistant message
            const { error: assistantMessageError } = await catchError(
                db.insert(chatMessageTable).values(assistantMessage),
            );

            if (assistantMessageError) return Error();

            // Emit event for the assistant message
            emit({
                event: 'chatMessageCreated',
                payload: assistantMessage,
            });

            let title: string | undefined = undefined;

            if (previousMessages.length === 0) {
                const { data: generatedTitle, error: generatedTitleError } =
                    await generateChatSessionTitle({
                        firstMessage: content,
                    });

                if (generatedTitleError) return Error();

                title = generatedTitle;

                console.log('-->   ~ emitting title:', title);

                emit({
                    event: 'chatSessionTitleUpdated',
                    payload: {
                        id: sessionId,
                        title,
                    },
                });
            }

            // Update session's updatedAt timestamp
            await catchError(
                db
                    .update(chatSessionTable)
                    .set({ updatedAt: Date.now(), title })
                    .where(eq(chatSessionTable.id, sessionId)),
            );

            return Success();
        }),
    );
