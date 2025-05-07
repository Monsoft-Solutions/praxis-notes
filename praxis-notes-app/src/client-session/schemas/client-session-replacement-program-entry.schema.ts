import { z } from 'zod';

export const clientSessionReplacementProgramEntrySchema = z.object({
    replacementProgram: z.string(),
    teachingProcedure: z.string().nullable(),
    promptingProcedure: z.string().nullable(),
    promptTypes: z.array(z.string()),
    clientResponse: z.string().nullable(),
    progress: z.number().nullable(),
});

export type ClientSessionReplacementProgramEntry = z.infer<
    typeof clientSessionReplacementProgramEntrySchema
>;
