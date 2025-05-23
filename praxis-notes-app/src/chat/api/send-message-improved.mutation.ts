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
import { generateChatResponseImproved } from '../utils/generate-chat-response-improved.util';
import { generateChatSessionTitle } from '../utils/generate-chat-session-title.util';

import { getChatSessionWithOptimalContext } from '../provider/get-chat-session-with-optimal-context.provider';

import { saveMessageAttachment } from '../provider/save-message-attachment.provider';
import { streamMessageUpdate } from '../utils/batch-update-manager.util';
import {
    countTokens,
    calculateMessageImportance,
    EnhancedContextSelectionResult,
    autoSummarizeIfNeeded,
} from '../utils';
import { selectOptimalContextOptimized } from '../utils/smart-context-manager-optimized.util';
import { getModel } from '../provider';
import { logger } from '@logger/providers';

export const sendMessageImproved = protectedEndpoint
    .input(createChatMessageSchema)
    .mutation(
        queryMutationCallback(
            async ({
                input: { content, attachments, sessionId, model },
                ctx: {
                    session: { user },
                },
            }) => {
                // Get previous messages with optimal context loading (only uncovered messages + summaries)
                const { data: chatSession, error: chatSessionError } =
                    await getChatSessionWithOptimalContext({
                        sessionId,
                        calculateMetadata: true,
                    });

                if (chatSessionError) return Error();

                const {
                    messages: previousMessages,
                    contextMetadata,
                    summaries,
                } = chatSession;

                // Enhanced logging for optimization tracking
                logger.info('Chat session optimal context loaded', {
                    sessionId,
                    totalMessages: contextMetadata.totalMessages,
                    totalSummaries: contextMetadata.totalSummaries,
                    totalTokens: contextMetadata.totalTokens,
                    contextUtilization: `${contextMetadata.contextUtilization.toFixed(1)}%`,
                    hasLongConversation: contextMetadata.hasLongConversation,
                    recommendsSummarization:
                        contextMetadata.recommendsSummarization,
                    messagesCoveredBySummaries:
                        contextMetadata.messagesCoveredBySummaries,
                    tokensSavedBySummaries:
                        contextMetadata.tokensSavedBySummaries,
                    optimizationUsed: contextMetadata.optimizationUsed,
                });

                // current timestamp
                const now = Date.now();

                const userMessageId = uuidv4();

                // Calculate metadata for user message
                const { data: userMessageTokens } = countTokens({
                    text: content,
                });

                // Create the user message with metadata
                const userMessage: ChatMessage = {
                    id: userMessageId,
                    sessionId,
                    content,
                    role: 'user',
                    createdAt: now,
                    attachments,
                };

                // Calculate importance score for the user message
                const { data: userImportanceResult } =
                    calculateMessageImportance({
                        message: userMessage,
                        allMessages: [...previousMessages, userMessage],
                    });

                // Insert user message with metadata
                const { error: userMessageError } = await catchError(
                    db.insert(chatMessageTable).values({
                        ...userMessage,
                        tokenCount: userMessageTokens,
                        importanceScore: userImportanceResult.score,
                    }),
                );

                if (userMessageError) return Error();

                // Save attachments in parallel with message insertion
                await Promise.all(
                    attachments.map((attachment) =>
                        saveMessageAttachment({
                            messageId: userMessageId,
                            file: attachment,
                        }),
                    ),
                );

                // Emit event for the user message
                emit({
                    event: 'chatMessageCreated',
                    payload: userMessage,
                });

                // Create the assistant message
                const assistantMessageId = uuidv4();
                const assistantMessage: ChatMessage = {
                    id: assistantMessageId,
                    sessionId,
                    content: '',
                    role: 'assistant',
                    createdAt: Date.now(),
                    attachments: [],
                };

                // Insert assistant message with initial metadata
                const { error: assistantMessageError } = await catchError(
                    db.insert(chatMessageTable).values({
                        ...assistantMessage,
                        tokenCount: 0, // Will be updated as content streams
                        importanceScore: 50, // Default score, will be updated after completion
                    }),
                );

                if (assistantMessageError) return Error();

                // Emit event for the assistant message
                emit({
                    event: 'chatMessageCreated',
                    payload: assistantMessage,
                });

                const allMessages = [...previousMessages, userMessage];

                // Use optimized context selection with pre-filtered messages and summaries
                const aiModelName = getModel(model);
                const { data: contextResult, error: contextError } =
                    selectOptimalContextOptimized({
                        messages: allMessages,
                        summaries,
                        model: aiModelName,
                        forceIncludeRecent: 3,
                        tokensSavedBySummaries:
                            contextMetadata.tokensSavedBySummaries,
                    });

                if (contextError) {
                    logger.error('Failed to select optimal context', {
                        sessionId,
                        messagesCount: allMessages.length,
                        summariesCount: summaries.length,
                        error: contextError,
                    });
                    return Error('CONTEXT_SELECTION_FAILED');
                }

                // Log optimized context usage metrics for monitoring
                logger.info('Optimized chat context selected', {
                    sessionId,
                    strategy: contextResult.selectionStrategy,
                    totalMessages: contextResult.totalMessages,
                    totalSummaries: contextResult.totalSummaries,
                    droppedMessages: contextResult.droppedMessages,
                    totalTokens: contextResult.totalTokens,
                    contextUtilization: `${contextResult.contextUtilization.toFixed(1)}%`,
                    avgImportanceScore: contextResult.averageImportanceScore,
                    tokensSavedBySummaries:
                        contextResult.tokensSavedBySummaries,
                    optimizationUsed: contextResult.optimizationUsed,
                });

                // Generate AI response using the optimized context
                const { data: responseStream, error: aiResponseError } =
                    await generateChatResponseImproved({
                        contextResult:
                            contextResult as EnhancedContextSelectionResult,
                        userBasicData: {
                            firstName: user.name,
                            lastName: user.lastName ?? '',
                            language: user.language ?? 'en',
                            userId: user.id,
                        },
                        chatSessionId: sessionId,
                        model,
                    });

                if (aiResponseError) return Error();

                let fullResponseContent = '';

                // Process streaming response with batched updates
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                while (true) {
                    const { done, value: textDelta } =
                        await responseStream.read();

                    if (done) break;

                    fullResponseContent += textDelta;

                    // Use batched update for streaming
                    const { error: streamError } = await streamMessageUpdate({
                        messageId: assistantMessageId,
                        sessionId,
                        content: textDelta,
                        isComplete: false,
                    });

                    if (streamError) {
                        logger.error('Stream update failed', {
                            sessionId,
                            messageId: assistantMessageId,
                            error: streamError,
                        });
                        return Error();
                    }
                }

                // Complete the stream and perform final updates
                const { error: finalStreamError } = await streamMessageUpdate({
                    messageId: assistantMessageId,
                    sessionId,
                    content: '',
                    isComplete: true,
                });

                if (finalStreamError) {
                    logger.error('Final stream completion failed', {
                        sessionId,
                        messageId: assistantMessageId,
                        error: finalStreamError,
                    });
                    return Error();
                }

                // Update assistant message metadata after completion
                const { data: assistantTokens } = countTokens({
                    text: fullResponseContent,
                });

                const completedAssistantMessage: ChatMessage = {
                    ...assistantMessage,
                    content: fullResponseContent,
                };

                const { data: assistantImportanceResult } =
                    calculateMessageImportance({
                        message: completedAssistantMessage,
                        allMessages: [
                            ...allMessages,
                            completedAssistantMessage,
                        ],
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

                let title: string | undefined = undefined;

                // Generate title for new conversations
                if (previousMessages.length === 0) {
                    const { data: generatedTitle, error: generatedTitleError } =
                        await generateChatSessionTitle({
                            firstMessage: content,
                            userBasicData: {
                                firstName: user.name,
                                lastName: user.lastName ?? '',
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

                // Log completion metrics with optimization details
                logger.info('Chat message completed with optimization', {
                    sessionId,
                    userMessageTokens,
                    assistantMessageTokens: assistantTokens,
                    userImportanceScore: userImportanceResult.score,
                    assistantImportanceScore: assistantImportanceResult.score,
                    responseLength: fullResponseContent.length,
                    optimizationUsed: contextResult.optimizationUsed,
                    tokensSavedBySummaries:
                        contextResult.tokensSavedBySummaries,
                    messagesCoveredBySummaries:
                        contextMetadata.messagesCoveredBySummaries,
                });

                void autoSummarizeIfNeeded({
                    sessionId,
                    contextResult:
                        contextResult as EnhancedContextSelectionResult,
                    userBasicData: {
                        userId: user.id,
                    },
                });

                return Success();
            },
        ),
    );
