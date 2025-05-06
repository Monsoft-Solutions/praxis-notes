import { z } from 'zod';

export const suggestedQuestionsRequested = z.object({
    sessionId: z.string(),
});

export type SuggestedQuestionsRequestedEvent = z.infer<
    typeof suggestedQuestionsRequested
>;
