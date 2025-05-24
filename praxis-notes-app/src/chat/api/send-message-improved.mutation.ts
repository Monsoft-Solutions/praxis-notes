import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { emit } from '@events/providers';

import { v4 as uuidv4 } from 'uuid';

import { createChatMessageSchema } from '../schemas';

import { getChatSessionWithOptimalContext } from '../provider/get-chat-session-with-optimal-context.provider';
import { createMessageWithMetadata } from '../provider/create-message-with-metadata.provider';
import { generateAiResponse } from '../provider/generate-ai-response.provider';
import { finalizeChatSession } from '../provider/finalize-chat-session.provider';

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
                // This preserves the contextMetadata that was already calculated
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

                // Create user message with metadata
                const { data: userMessageResult, error: userMessageError } =
                    await createMessageWithMetadata({
                        content,
                        attachments,
                        sessionId,
                        role: 'user',
                        allMessages: previousMessages,
                    });

                if (userMessageError) return Error();

                const {
                    message: userMessage,
                    tokenCount: userTokenCount,
                    importanceScore: userImportanceScore,
                } = userMessageResult;

                // Create assistant message placeholder
                const assistantMessageId = uuidv4();
                const {
                    data: assistantMessageResult,
                    error: assistantMessageError,
                } = await createMessageWithMetadata({
                    content: '',
                    attachments: [],
                    sessionId,
                    role: 'assistant',
                    allMessages: [...previousMessages, userMessage],
                    messageId: assistantMessageId,
                });

                if (assistantMessageError) return Error();

                // Emit event for the assistant message
                emit({
                    event: 'chatMessageCreated',
                    payload: assistantMessageResult.message,
                });

                const allMessages = [...previousMessages, userMessage];

                // Use optimized context selection with pre-filtered messages and summaries
                // This reuses the existing contextMetadata instead of regenerating it
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
                const { data: responseResult, error: aiResponseError } =
                    await generateAiResponse({
                        contextResult,
                        userBasicData: {
                            firstName: user.name,
                            lastName: user.lastName ?? '',
                            language: user.language ?? 'en',
                            userId: user.id,
                        },
                        chatSessionId: sessionId,
                        model,
                        assistantMessageId,
                        allMessages,
                    });

                if (aiResponseError) return Error();

                const {
                    tokenCount: assistantTokenCount,
                    importanceScore: assistantImportanceScore,
                } = responseResult;

                // Finalize session with title generation and auto-summarization
                const { error: finalizeError } = await finalizeChatSession({
                    sessionId,
                    isFirstMessage: previousMessages.length === 0,
                    firstMessageContent: content,
                    userBasicData: {
                        firstName: user.name,
                        lastName: user.lastName ?? '',
                        language: user.language ?? 'en',
                        userId: user.id,
                    },
                    contextResult,
                    messageMetrics: {
                        userTokenCount,
                        assistantTokenCount,
                        userImportanceScore,
                        assistantImportanceScore,
                    },
                });

                if (finalizeError) return Error();

                return Success();
            },
        ),
    );
