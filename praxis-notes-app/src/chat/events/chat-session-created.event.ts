import { z } from 'zod';

// chat-session-created event schema
export const chatSessionCreated = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    createdAt: z.number(),
});

// chat-session-created event type
export type ChatSessionCreatedEvent = z.infer<typeof chatSessionCreated>;
