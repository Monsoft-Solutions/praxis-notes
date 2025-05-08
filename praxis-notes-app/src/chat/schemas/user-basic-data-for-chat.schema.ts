import { z } from 'zod';

export const userBasicDataForChatSchema = z.object({
    firstName: z.string(),
    lastName: z.string().nullable().optional(),
    language: z.string(),
    userId: z.string(),
});

export type UserBasicDataForChat = z.infer<typeof userBasicDataForChatSchema>;
