import { userLangEnumSchema } from '@auth/enum/user-lang.enum';
import { z } from 'zod';

export const updateUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    language: userLangEnumSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
