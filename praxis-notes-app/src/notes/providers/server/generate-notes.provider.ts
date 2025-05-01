import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { generateText } from '@src/ai/providers';
import { logger } from '@logger/providers';
import { GenerateNoteSchema } from '@src/notes/schema/generate-note.schema';

// Helper function to generate notes using Anthropic
export const generateNotes = (async (input: GenerateNoteSchema) => {
    // Use the prompt from our dedicated module
    const start = performance.now();
    const { data: prompt } = generateNotesPrompt(input);

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
}) satisfies Function<GenerateNoteSchema, string>;
