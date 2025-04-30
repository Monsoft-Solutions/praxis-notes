import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { ClientSession } from '@src/client-session/schemas';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { generateText } from '@src/ai/providers';
import { logger } from '@logger/providers';

// Helper function to generate notes using Anthropic
export const generateNotes = (async (sessionData: ClientSession) => {
    // Use the prompt from our dedicated module
    const start = performance.now();
    const { data: prompt } = generateNotesPrompt(sessionData);

    const { data: text, error: textGenerationError } = await generateText({
        prompt,
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    const end = performance.now();
    logger.debug('Time taken to generate notes', {
        time: `${Math.round((end - start) / 1000)} seconds`,
        service: 'generateNotes',
        promptSize: prompt.length,
        responseSize: text.length,
    });

    return Success(text);
}) satisfies Function<ClientSession, string>;
