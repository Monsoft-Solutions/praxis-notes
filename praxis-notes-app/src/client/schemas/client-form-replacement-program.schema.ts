import { z } from 'zod';

/**
 * Client replacement program schema
 */
export const clientFormReplacementProgramSchema = z.object({
    id: z.string(),

    baseline: z.coerce.number(),

    behaviorIds: z.array(z.string()),
});

export type ClientFormReplacementProgram = z.infer<
    typeof clientFormReplacementProgramSchema
>;
