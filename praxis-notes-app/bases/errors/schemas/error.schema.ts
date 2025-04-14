import { z } from 'zod';

export const errorSchema = z.object({
    code: z.string(),
    message: z.string().optional(),
});

export type ErrorType = z.infer<typeof errorSchema>;
