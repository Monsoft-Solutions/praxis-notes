import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateText } from '@src/ai/providers';

import { transformNotesPrompt } from './transform-notes-prompt.provider';
import { TransformNoteType } from '@src/notes/schema';

// Helper function to transform notes using Anthropic
export const transformNotesProvider = (async ({
    notes,
    userId,
    transformationType,
    customInstructions,
}: {
    notes: string;
    userId: string;
    transformationType: TransformNoteType;
    customInstructions?: string;
}) => {
    // Use the prompt from our dedicated module
    const prompt = transformNotesPrompt({
        notes,
        transformationType,
        customInstructions,
    });

    const { data: textStream, error: textGenerationError } = await generateText(
        {
            prompt,
            modelParams: {
                model: 'claude-3-7-sonnet-latest',
                provider: 'anthropic',
                activeTools: ['think'],
                userBasicData: {
                    userId,
                },
                callerName: 'transformNotes',
            },
        },
    );

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    {
        notes: string;
        userId: string;
        transformationType: TransformNoteType;
        customInstructions?: string;
    },
    string
>;
