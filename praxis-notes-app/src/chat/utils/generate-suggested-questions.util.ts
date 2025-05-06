import { z } from 'zod';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateText } from '@src/ai/providers';
import { jsonParse } from '@shared/utils/json-parse.util';

const questionSuggestionSchema = z.array(z.string());

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

    Format the response as a simple JSON array with exactly 4 strings, nothing else.

    The questions/instructions should be in the user's preferred language.

    The questions/instructions should have a maximum of 20 words each.

    User's preferred language: ${userLanguage}
    User's name: ${userName}`;

    const { data: generatedText, error: generateTextError } =
        await generateText({
            prompt,
            modelParams: {
                provider: 'anthropic',
                model: 'claude-3-haiku-20240307',
                activeTools: [],
            },
        });

    if (generateTextError) return Error('AI_COMPLETION_FAILED');

    const { data: json, error: jsonError } = jsonParse(generatedText);

    if (jsonError) return Error('INVALID_JSON_RESPONSE');

    const parsedResponse = questionSuggestionSchema.safeParse(json);

    if (!parsedResponse.success) {
        return Error('INVALID_RESPONSE_FORMAT');
    }

    const { data: questions } = parsedResponse;

    return Success(questions);
}) satisfies Function<
    {
        userName: string;
        userLanguage?: string;
    },
    string[]
>;
