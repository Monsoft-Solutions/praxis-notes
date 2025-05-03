import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { streamText } from '@src/ai/providers';

import { GenerateNoteSchema } from '@src/notes/schema/generate-note.schema';
import { AiRequest } from '@src/ai/type/ai-request.type';

// Helper function to generate notes using Anthropic
export const generateNotes = (async ({
    input,
}: {
    input: GenerateNoteSchema;
}) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt(input);

    const { data: textStream, error: textGenerationError } = await streamText({
        prompt,
        modelParams: {
            model: 'claude-3-7-sonnet-latest',
            provider: 'anthropic',
            active_tools: ['think'],
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    { input: GenerateNoteSchema; modelParams: AiRequest },
    ReadableStreamDefaultReader<string>
>;
