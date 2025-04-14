import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { ClientSession } from '@src/client-session/schemas';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

// Helper function to generate notes using Anthropic
export const generateNotes = (async (sessionData: ClientSession) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt(sessionData);

    const { text } = await generateText({
        model: anthropic('claude-3-7-sonnet-latest'),
        // model: openai("gpt-4.5-preview"),
        prompt,
    });

    return Success(text);
}) satisfies Function<ClientSession, string>;
