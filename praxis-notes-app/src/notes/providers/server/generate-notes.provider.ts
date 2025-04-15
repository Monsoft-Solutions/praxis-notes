import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { ClientSession } from '@src/client-session/schemas';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { generateText } from '@src/ai/providers';

// Helper function to generate notes using Anthropic
export const generateNotes = (async (sessionData: ClientSession) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt(sessionData);

    const { data: text, error: textGenerationError } = await generateText({
        prompt,
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(text);
}) satisfies Function<ClientSession, string>;
