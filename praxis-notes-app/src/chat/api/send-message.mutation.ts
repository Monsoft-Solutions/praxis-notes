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
import { userTable } from '@db/db.tables';
export const sendMessage = protectedEndpoint
    .input(createChatMessageSchema)
    .mutation(
        queryMutationCallback(
            async ({ input: { content, sessionId }, ctx: { session } }) => {
                // Get previous messages for context
                const { data: previousMessages, error: previousMessagesError } =
                    await catchError(
                        db.query.chatMessageTable.findMany({
                            where: eq(chatMessageTable.sessionId, sessionId),
                            orderBy: chatMessageTable.createdAt,
                        }),
                    );

                if (previousMessagesError) return Error();

                const { data: user, error: userError } = await catchError(
                    db.query.userTable.findFirst({
                        where: eq(userTable.id, session.user.id),
                        columns: {
                            firstName: true,
                            language: true,
                        },
                    }),
                );

                if (userError) return Error();

                const userName = user?.firstName;
                const userLanguage = user?.language;
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

                // Create the assistant message
                const assistantMessage: ChatMessage = {
                    id: uuidv4(),
                    sessionId,
                    content: '',
                    role: 'assistant',
                    createdAt: Date.now(),
                };

                // Emit event for the assistant message
                emit({
                    event: 'chatMessageCreated',
                    payload: assistantMessage,
                });

                // Insert assistant message
                const { error: assistantMessageError } = await catchError(
                    db.insert(chatMessageTable).values(assistantMessage),
                );

                if (assistantMessageError) return Error();

                const allMessages = [...previousMessages, userMessage];

                // Generate AI response
                const { data: responseStream, error: aiResponseError } =
                    await generateChatResponse({
                        messages: allMessages,
                        userName: userName ?? 'Jane Doe',
                        userId: session.user.id,
                        userLanguage: userLanguage ?? 'en',
                    });

                if (aiResponseError) return Error();

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                while (true) {
                    const { done, value: textDelta } =
                        await responseStream.read();

                    if (done) break;

                    // update assistant message
                    const { error: assistantMessageError } = await catchError(
                        db.transaction(async (tx) => {
                            const currentMessage =
                                await tx.query.chatMessageTable.findFirst({
                                    where: eq(
                                        chatMessageTable.id,
                                        assistantMessage.id,
                                    ),
                                });

                            if (!currentMessage) throw 'MESSAGE_NOT_FOUND';

                            const { content: currentContent } = currentMessage;

                            const newContent = currentContent + textDelta;

                            await tx
                                .update(chatMessageTable)
                                .set({ content: newContent })
                                .where(
                                    eq(
                                        chatMessageTable.id,
                                        assistantMessage.id,
                                    ),
                                );

                            emit({
                                event: 'chatMessageUpdated',
                                payload: {
                                    sessionId,
                                    id: assistantMessage.id,
                                    content: newContent,
                                },
                            });
                        }),
                    );

                    if (assistantMessageError) return Error();
                }

                let title: string | undefined = undefined;

                if (previousMessages.length === 0) {
                    const { data: generatedTitle, error: generatedTitleError } =
                        await generateChatSessionTitle({
                            firstMessage: content,
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

                // Update session's updatedAt timestamp
                await catchError(
                    db
                        .update(chatSessionTable)
                        .set({ updatedAt: Date.now(), title })
                        .where(eq(chatSessionTable.id, sessionId)),
                );

                return Success();
            },
        ),
    );
