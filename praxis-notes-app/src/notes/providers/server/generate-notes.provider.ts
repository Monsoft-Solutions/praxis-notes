import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { streamText } from '@src/ai/providers';

import { GenerateNoteSchema } from '@src/notes/schema/generate-note.schema';

// Helper function to generate notes using Anthropic
export const generateNotes = (async (input: GenerateNoteSchema) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt(input);

    const { data: textStream, error: textGenerationError } = await streamText({
        prompt,
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<GenerateNoteSchema, ReadableStreamDefaultReader<string>>;
