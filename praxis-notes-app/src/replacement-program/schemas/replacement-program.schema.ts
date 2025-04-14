import { z } from 'zod';

export const replacementProgramSchema = z.object({
    id: z.string(),
    organizationId: z.string().nullable(),
    category: z.string().max(100).optional(),
    name: z.string().min(1),
    description: z.string().nullable(),
});

export type ReplacementProgram = z.infer<typeof replacementProgramSchema>;
