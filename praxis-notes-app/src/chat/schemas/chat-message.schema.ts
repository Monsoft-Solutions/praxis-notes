import { z } from 'zod';

import { chatMessageAuthorEnum } from '../enums';

export const chatMessageSchema = z.object({
    id: z.string(),
    sessionId: z.string(),
    content: z.string(),
    role: chatMessageAuthorEnum,
    createdAt: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
