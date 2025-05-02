import { z } from 'zod';

// chat-message-updated event schema
export const chatMessageUpdated = z.object({
    id: z.string(),
    sessionId: z.string(),
    content: z.string(),
});

// chat-message-updated event type
export type ChatMessageUpdatedEvent = z.infer<typeof chatMessageUpdated>;
