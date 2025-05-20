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

import { getChatSession } from '../provider';

export const sendMessage = protectedEndpoint
    .input(createChatMessageSchema)
    .mutation(
        queryMutationCallback(
            async ({
                input: { content, sessionId, model },
                ctx: {
                    session: { user },
                },
            }) => {
                // Get previous messages for context
                const { data: chatSession, error: chatSessionError } =
                    await getChatSession({ sessionId });

                if (chatSessionError) return Error();

                const { messages: previousMessages } = chatSession;

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
                        userBasicData: {
                            firstName: user.name,
                            lastName: user.lastName,
                            language: user.language ?? 'en',
                            userId: user.id,
                        },
                        chatSessionId: sessionId,
                        model,
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
                            userBasicData: {
                                firstName: user.name,
                                lastName: user.lastName,
                                language: user.language ?? 'en',
                                userId: user.id,
                            },
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
