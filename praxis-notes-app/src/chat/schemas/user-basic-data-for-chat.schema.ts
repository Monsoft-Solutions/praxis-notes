import { z } from 'zod';

export const userBasicDataForChatSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().nullable().optional(),
    language: z.string().default('en').optional(),
    userId: z.string(),
});

export type UserBasicDataForChat = z.infer<typeof userBasicDataForChatSchema>;
