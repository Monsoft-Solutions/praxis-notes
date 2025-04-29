import { z } from 'zod';

// Event sent when a support message is submitted
export const supportMessageSubmittedEvent = {
    name: 'supportMessageSubmitted',
    schema: z.object({
        id: z.string(),
        userId: z.string().nullable(),
        name: z.string().optional(),
        phone: z.string(),
        message: z.string(),
        createdAt: z.number(),
    }),
} as const;
