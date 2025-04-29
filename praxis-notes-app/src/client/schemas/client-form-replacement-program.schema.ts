import { z } from 'zod';

/**
 * Client replacement program schema
 */
export const clientFormReplacementProgramSchema = z.object({
    id: z.string().nonempty('Replacement program selection is required'),

    behaviorIds: z.array(z.string()),
});

export type ClientFormReplacementProgram = z.infer<
    typeof clientFormReplacementProgramSchema
>;
