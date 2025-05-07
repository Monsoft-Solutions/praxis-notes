import { z } from 'zod';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateObject } from '@src/ai/providers';

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
    const prompt = `Generate 4 engaging, specific questions or instructions about Applied Behavior Analysis (ABA) therapy 
    that a user might want to ask an AI assistant. 
    These should be diverse, covering different aspects of ABA such as techniques, implementation, data collection, 
    or specific challenges.

    The questions/instructions should be clear, specific, and invite detailed responses. They should be appropriate for 
    someone interested in learning about or implementing ABA therapy.

    The questions/instructions should be in the user's preferred language.

    The questions/instructions should have a maximum of 20 words each.

    User's preferred language: ${userLanguage}
    User's name: ${userName}`;

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
