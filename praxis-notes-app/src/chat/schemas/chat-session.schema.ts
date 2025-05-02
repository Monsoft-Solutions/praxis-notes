import { z } from 'zod';

export const chatSessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;
