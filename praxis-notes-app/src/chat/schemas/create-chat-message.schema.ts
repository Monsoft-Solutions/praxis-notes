import { z } from 'zod';

export const createChatMessageSchema = z.object({
    sessionId: z.string(),
    content: z.string(),
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;
