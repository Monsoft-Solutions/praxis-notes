import { catchError } from '@errors/utils/catch-error.util';
import { generateText } from '@src/ai/providers';
import { z } from 'zod';

const questionSuggestionSchema = z.array(z.string());

/**
 * Generates four suggested questions/instructions related to ABA (Applied Behavior Analysis)
 * for a new chat session
 */
export async function generateSuggestedQuestions({
    userName,
    userLanguage = 'en',
}: {
    userName: string;
    userLanguage?: string;
}) {
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

    try {
        const { data: completion, error } = await catchError(
            generateText({
                prompt,
                modelParams: {
                    provider: 'anthropic',
                    model: 'claude-3-7-sonnet-latest',
                    active_tools: [],
                },
            }),
        );

        console.log('completion', completion);

        if (error) {
            return { error: 'AI_COMPLETION_FAILED' };
        }

        try {
            const parsedResponse = questionSuggestionSchema.safeParse(
                completion.data,
            );
            if (!parsedResponse.success) {
                return { error: 'INVALID_RESPONSE_FORMAT' };
            }

            return { data: parsedResponse.data };
        } catch {
            return { error: 'INVALID_JSON_RESPONSE' };
        }
    } catch {
        return { error: 'UNEXPECTED_ERROR' };
    }
}
