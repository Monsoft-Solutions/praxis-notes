import { z } from 'zod';

/**
 * Client replacement program schema
 */
export const clientFormReplacementProgramSchema = z.object({
    id: z.string(),

    behaviorIds: z.array(z.string()),
});

export type ClientFormReplacementProgram = z.infer<
    typeof clientFormReplacementProgramSchema
>;
