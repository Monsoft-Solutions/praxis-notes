import { z } from 'zod';

export const clientReplacementProgramSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string().nullable(),
    isCustom: z.boolean().default(false),
    behaviorIds: z.array(z.string()),
});

export type ClientReplacementProgram = z.infer<
    typeof clientReplacementProgramSchema
>;
