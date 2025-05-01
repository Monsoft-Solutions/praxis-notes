import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { generateText } from '@src/ai/providers';

import { Message } from 'ai';

const prompt = `
    You are a helpful assistant that generates a title for a chat session.
    The title should be a short description of the conversation.
    The title should be no more than 20 characters.
`;

/**
 * Generates an AI response for a chat conversation
 *
 * @param firstMessage - The first message in the conversation
 * @returns A string containing the AI's response
 */
export const generateChatSessionTitle = (async ({
    firstMessage,
}: {
    firstMessage: string;
}) => {
    const messages: Message[] = [
        {
            id: 'prompt',
            role: 'system',
            content: prompt,
        },

        {
            id: 'user',
            role: 'user',
            content: firstMessage,
        },
    ];

    const { data: text, error: textGenerationError } = await generateText({
        messages,
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(text);
}) satisfies Function<{ firstMessage: string }, string>;
