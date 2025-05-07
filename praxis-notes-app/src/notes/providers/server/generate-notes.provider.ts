import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { streamText } from '@src/ai/providers';

import { GenerateNotesInput } from '@src/notes/schema/generate-note.schema';

// Helper function to generate notes using Anthropic
export const generateNotes = (async ({
    clientData,
    sessionData,
    userBasicData,
}: GenerateNotesInput) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt({
        clientData,
        sessionData,
    });

    const { data: textStream, error: textGenerationError } = await streamText({
        prompt,
        modelParams: {
            model: 'claude-3-7-sonnet-latest',
            provider: 'anthropic',
            activeTools: ['think'],
            userBasicData,
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<GenerateNotesInput, ReadableStreamDefaultReader<string>>;
