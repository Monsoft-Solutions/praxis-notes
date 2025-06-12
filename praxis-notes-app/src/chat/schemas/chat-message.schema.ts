import { z } from 'zod';

import { chatMessageAuthorEnum } from '../enums';

import { fileSchema } from '@shared/schemas';

export const chatMessageSchema = z.object({
    id: z.string(),
    sessionId: z.string(),
    content: z.string(),
    role: chatMessageAuthorEnum,
    createdAt: z.number(),
    attachments: z.array(fileSchema),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
