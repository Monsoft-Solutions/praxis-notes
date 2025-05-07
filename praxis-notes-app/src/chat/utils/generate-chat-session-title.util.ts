import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { generateText } from '@src/ai/providers';

import { Message } from 'ai';
import { UserBasicDataForChat } from '../schemas';

const prompt = `
You are a helpful assistant that generates a title for a chat session.
The title should be a short description of the conversation.
The title should be no more than 20 characters.
Your output should only contain the title, nothing else.

Here are some examples:

User: I need help debugging my React component that's not re-rendering properly
Assistant: React Debug Help

User: Can you explain how promises work in JavaScript?
Assistant: JS Promises Guide

User: What's the best way to structure a large Node.js application?
Assistant: Node App Structure

User: How do I implement authentication in my Express app?
Assistant: Auth in Express

User: Can you help me understand Redux state management?
Assistant: Redux Basics 
`;

/**
 * Generates an AI response for a chat conversation
 *
 * @param firstMessage - The first message in the conversation
 * @returns A string containing the AI's response
 */
export const generateChatSessionTitle = (async ({
    firstMessage,
    userBasicData,
}: {
    firstMessage: string;
    userBasicData: UserBasicDataForChat;
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
        modelParams: {
            model: 'claude-3-haiku-20240307',
            provider: 'anthropic',
            activeTools: [],
            callerName: 'generateChatSessionTitle',
            userBasicData,
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(text);
}) satisfies Function<
    {
        firstMessage: string;
        userBasicData: UserBasicDataForChat;
    },
    string
>;
