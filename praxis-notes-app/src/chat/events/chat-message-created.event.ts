import { z } from 'zod';

import { chatMessageAuthorEnum } from '../enums';

// chat-message-created event schema
export const chatMessageCreated = z.object({
    id: z.string(),
    sessionId: z.string(),
    content: z.string(),
    role: chatMessageAuthorEnum,
    createdAt: z.number(),
});

// chat-message-created event type
export type ChatMessageCreatedEvent = z.infer<typeof chatMessageCreated>;
