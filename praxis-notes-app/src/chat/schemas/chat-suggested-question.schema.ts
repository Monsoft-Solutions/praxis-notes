import { z } from 'zod';

export const chatSuggestedQuestionSchema = z.object({
    id: z.string(),
    sessionId: z.string(),
    questionText: z.string(),
    createdAt: z.number(),
});

export type ChatSuggestedQuestion = z.infer<typeof chatSuggestedQuestionSchema>;
