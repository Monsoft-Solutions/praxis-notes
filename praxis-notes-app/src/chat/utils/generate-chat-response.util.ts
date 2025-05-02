import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { ChatMessage } from '../schemas';
import { chatSessionSystemPrompt } from '../constants';

import { streamText } from '@src/ai/providers';
import { Message } from 'ai';

/**
 * Generates an AI response for a chat conversation
 *
 * @param messages - The conversation history
 * @returns A string containing the AI's response
 */
export const generateChatResponse = (async ({
    messages,
    userName,
}: {
    messages: ChatMessage[];
    userName: string;
}) => {
    // Prepare the conversation history
    const messageHistory = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
    }));

    console.log('userName', userName);

    // Add system message at the start
    const systemMessage: Message = {
        id: 'prompt',
        role: 'system',
        content: chatSessionSystemPrompt(userName),
    };

    console.log('systemMessage', systemMessage);

    // Typically here, you would call an external AI API (OpenAI, Anthropic, etc.)
    // For this implementation, we'll mock a response

    // In a real implementation, you would:
    // 1. Send the request to the AI API
    // 2. Process the response
    // 3. Return the generated text

    const { data: textStream, error: textGenerationError } = await streamText({
        messages: [systemMessage, ...messageHistory],
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    { messages: ChatMessage[]; userName: string },
    ReadableStreamDefaultReader<string>
>;
