import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { ChatMessage, UserBasicDataForChat } from '../schemas';
import { chatSessionSystemPrompt, getModel } from '../provider';

import { streamText } from '@src/ai/providers';
import { CoreMessage, FilePart } from 'ai';
import { UserLang } from '@auth/enum/user-lang.enum';
import { AiGenerationQualitySelector } from '@src/ai/schemas';

/**
 * Generates an AI response for a chat conversation
 *
 * @param messages - The conversation history
 * @returns A string containing the AI's response
 */
export const generateChatResponse = (async ({
    messages,
    userBasicData,
    chatSessionId,
    model,
}: {
    messages: ChatMessage[];
    userBasicData: UserBasicDataForChat;
    chatSessionId: string;
    model: AiGenerationQualitySelector;
}) => {
    // Prepare the conversation history
    const messageHistory: CoreMessage[] = messages.map((msg) => {
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
    });

    const { data: systemPrompt } = chatSessionSystemPrompt({
        userName: userBasicData.firstName ?? '',
        userId: userBasicData.userId,
        userLanguage: userBasicData.language as UserLang,
        organizationId: userBasicData.organizationId ?? '',
    });

    // Add system message at the start
    const systemMessage: CoreMessage = {
        role: 'system',
        content: systemPrompt,
    };

    // Typically here, you would call an external AI API (OpenAI, Anthropic, etc.)
    // For this implementation, we'll mock a response

    // In a real implementation, you would:
    // 1. Send the request to the AI API
    // 2. Process the response
    // 3. Return the generated text

    const { data: textStream, error: textGenerationError } = await streamText({
        messages: [systemMessage, ...messageHistory],
        modelParams: {
            model: getModel(model),
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
            callerName: 'generateChatResponse',
            chatSessionId,
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    {
        messages: ChatMessage[];
        userBasicData: UserBasicDataForChat;
        chatSessionId: string;
        model: AiGenerationQualitySelector;
    },
    ReadableStreamDefaultReader<string>
>;
