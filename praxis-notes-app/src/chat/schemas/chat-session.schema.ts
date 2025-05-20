import { z } from 'zod';

import { chatMessageSchema } from './chat-message.schema';

export const chatSessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    messages: z.array(chatMessageSchema),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;
