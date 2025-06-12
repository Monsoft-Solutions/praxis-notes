import { z } from 'zod';

import { chatMessageAuthorEnum } from '../enums';

import { fileSchema } from '@shared/schemas/file.schema';

// chat-message-created event schema
export const chatMessageCreated = z.object({
    id: z.string(),
    sessionId: z.string(),
    content: z.string(),
    role: chatMessageAuthorEnum,
    createdAt: z.number(),
    attachments: z.array(fileSchema),
});

// chat-message-created event type
export type ChatMessageCreatedEvent = z.infer<typeof chatMessageCreated>;
