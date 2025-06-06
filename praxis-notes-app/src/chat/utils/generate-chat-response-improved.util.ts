import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import {
    UserBasicDataForChat,
    OptimizedContextSelectionResult,
} from '../schemas';
import { chatSessionSystemPrompt, getModel } from '../provider';

import { streamText } from '@src/ai/providers';
import { CoreMessage, FilePart } from 'ai';
import { UserLang } from '@auth/enum/user-lang.enum';
import { AiGenerationQualitySelector } from '@src/ai/schemas';

import { logger } from '@logger/providers';

/**
 * Generate AI response with smart context management
 * Uses importance-based message selection to stay within token limits
 */
export const generateChatResponseImproved = (async ({
    contextResult,
    userBasicData,
    chatSessionId,
    model,
}: {
    contextResult: OptimizedContextSelectionResult;
    userBasicData: UserBasicDataForChat;
    chatSessionId: string;
    model: AiGenerationQualitySelector;
}) => {
    const aiModelName = getModel(model);

    // Log context usage metrics for monitoring
    logger.info('Chat context selected', {
        sessionId: chatSessionId,
        strategy: contextResult.selectionStrategy,
        totalMessages: contextResult.totalMessages,
        droppedMessages: contextResult.droppedMessages,
        totalTokens: contextResult.totalTokens,
        contextUtilization: `${contextResult.contextUtilization.toFixed(1)}%`,
        avgImportanceScore: contextResult.averageImportanceScore,
    });

    // Prepare the conversation history from selected messages
    const messageHistory: CoreMessage[] = contextResult.selectedMessages.map(
        (msg) => {
            const attachmentsParts: FilePart[] = msg.attachments.map(
                (attachment) => ({
                    type: 'file',
                    mimeType: attachment.type,
                    data: attachment.base64,
                }),
            );

            return {
                id: msg.id,
                role: msg.role,
                content: [
                    {
                        type: 'text',
                        text: msg.content,
                    },
                    ...attachmentsParts,
                ],
            };
        },
    );

    if (!userBasicData.organizationId) {
        throw Error('ORGANIZATION_ID_NOT_FOUND');
    }

    const { data: systemPrompt } = chatSessionSystemPrompt({
        userName: userBasicData.firstName ?? '',
        userId: userBasicData.userId,
        userLanguage: userBasicData.language as UserLang,
        organizationId: userBasicData.organizationId,
    });

    // Add system message at the start
    const systemMessage: CoreMessage = {
        role: 'system',
        content: systemPrompt,
    };

    // Add context awareness note if messages were dropped
    let contextAwarenessNote = '';
    if (contextResult.droppedMessages > 0) {
        contextAwarenessNote = `\n\nNote: This conversation contains ${contextResult.totalMessages + contextResult.droppedMessages} total messages. For optimal performance, I'm focusing on the ${contextResult.totalMessages} most relevant recent messages (${contextResult.droppedMessages} earlier messages not included in current context).`;

        // Modify system message to include context awareness
        systemMessage.content = systemPrompt + contextAwarenessNote;
    }

    const { data: textStream, error: textGenerationError } = await streamText({
        messages: [systemMessage, ...messageHistory],
        modelParams: {
            model: aiModelName,
            activeTools: [
                'getClientData',
                'listAvailableClients',
                'think',
                'createClient',
                'listSystemBehaviors',
                'listReinforcers',
                'listReplacementPrograms',
                'listInterventions',
            ],
            userBasicData: {
                ...userBasicData,
                lastName: userBasicData.lastName ?? '',
            },
            callerName: 'generateChatResponseImproved',
            chatSessionId,
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    {
        contextResult: OptimizedContextSelectionResult;
        userBasicData: UserBasicDataForChat;
        chatSessionId: string;
        model: AiGenerationQualitySelector;
    },
    ReadableStreamDefaultReader<string>
>;
