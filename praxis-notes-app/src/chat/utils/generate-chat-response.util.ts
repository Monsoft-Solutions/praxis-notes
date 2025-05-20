import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { ChatMessage, UserBasicDataForChat } from '../schemas';
import { chatSessionSystemPrompt } from '../provider';

import { streamText } from '@src/ai/providers';
import { Message } from 'ai';
import { UserLang } from '@auth/enum/user-lang.enum';
import { anthropicModelEnum } from '@src/ai/enums';
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
    const messageHistory = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
    }));

    const { data: systemPrompt } = chatSessionSystemPrompt({
        userName: userBasicData.firstName ?? '',
        userId: userBasicData.userId,
        userLanguage: userBasicData.language as UserLang,
    });

    // Add system message at the start
    const systemMessage: Message = {
        id: 'prompt',
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
            activeTools: ['getClientData', 'listAvailableClients', 'think'],
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

const getModel = (model: AiGenerationQualitySelector) => {
    switch (model) {
        case 'Fast':
            return anthropicModelEnum.Enum['claude-3-haiku-20240307'];
        case 'Smart':
            return anthropicModelEnum.Enum['claude-3-5-haiku-latest'];
        case 'Genius':
            return anthropicModelEnum.Enum['claude-3-7-sonnet-latest'];
    }
};
