import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateText } from '@src/ai/providers';

import { transformNotesPrompt } from './transform-notes-prompt.provider';
import { TransformNoteType } from '@src/notes/schema';
import { ClientSession } from '@src/client-session/schemas';

// Helper function to transform notes using Anthropic
export const transformNotesProvider = (async ({
    notes,
    userId,
    transformationType,
    customInstructions,
    sessionData,
}: {
    notes: string;
    userId: string;
    transformationType: TransformNoteType;
    customInstructions?: string;
    sessionData: ClientSession;
}) => {
    // Use the prompt from our dedicated module
    const prompt = transformNotesPrompt({
        notes,
        transformationType,
        customInstructions,
        sessionData,
    });

    const { data: textStream, error: textGenerationError } = await generateText(
        {
            prompt,
            modelParams: {
                model: 'claude-3-5-haiku-latest',
                activeTools: [],
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
        sessionData: ClientSession;
    },
    string
>;
