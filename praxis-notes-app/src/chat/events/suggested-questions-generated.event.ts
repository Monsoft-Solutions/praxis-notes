import { z } from 'zod';

export const suggestedQuestionsGenerated = z.object({
    sessionId: z.string(),
    questions: z.array(
        z.object({
            id: z.string(),
            questionText: z.string(),
        }),
    ),
});

export type SuggestedQuestionsGeneratedEvent = z.infer<
    typeof suggestedQuestionsGenerated
>;
