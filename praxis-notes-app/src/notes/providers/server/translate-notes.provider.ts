import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateText } from '@src/ai/providers';

import { translateNotesPrompt } from './translate-notes-prompt.provider';

// Helper function to generate notes using Anthropic
export const translateNotesProvider = (async ({
    notes,
    userId,
    baseLanguage = 'Spanish',
    targetLanguage = 'English',
}: {
    notes: string;
    userId: string;
    baseLanguage?: string;
    targetLanguage?: string;
}) => {
    // Use the prompt from our dedicated module
    const prompt = translateNotesPrompt({
        notes,
        baseLanguage,
        targetLanguage,
    });

    const { data: textStream, error: textGenerationError } = await generateText(
        {
            prompt,
            modelParams: {
                model: 'claude-3-haiku-20240307',
                activeTools: [],
                userBasicData: {
                    userId,
                },
                callerName: 'translateNotes',
            },
        },
    );

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<
    {
        notes: string;
        userId: string;
        baseLanguage: string;
        targetLanguage: string;
    },
    string
>;
