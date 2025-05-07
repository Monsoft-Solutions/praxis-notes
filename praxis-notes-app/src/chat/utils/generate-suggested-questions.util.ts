import { z } from 'zod';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateObject } from '@src/ai/providers';
import { chatSuggestedQuestionsPrompt } from '../prompts';

const questionSuggestionSchema = z.object({
    questions: z.array(z.string()),
});

type QuestionSuggestionSchema = z.infer<typeof questionSuggestionSchema>;

/**
 * Generates four suggested questions/instructions related to ABA (Applied Behavior Analysis)
 * for a new chat session
 */
export const generateSuggestedQuestions = (async ({
    userName,
    userLanguage = 'en',
}: {
    userName: string;
    userLanguage?: string;
}) => {
    const prompt = chatSuggestedQuestionsPrompt({
        userName,
        userLanguage,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: generatedObject, error: generateObjectError } =
        await generateObject({
            prompt,
            modelParams: {
                provider: 'anthropic',
                model: 'claude-3-haiku-20240307',
                activeTools: [],
            },
            outputSchema: questionSuggestionSchema,
        });

    if (generateObjectError) return Error('AI_COMPLETION_FAILED');

    const array = (generatedObject as QuestionSuggestionSchema).questions;

    return Success(array);
}) satisfies Function<
    {
        userName: string;
        userLanguage?: string;
    },
    string[]
>;
