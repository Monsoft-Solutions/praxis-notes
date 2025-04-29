import { z } from 'zod';

export const clientSessionReplacementProgramEntrySchema = z.object({
    replacementProgram: z.string(),
    teachingProcedure: z.string().nullable(),
    promptingProcedure: z.string().nullable(),
    promptTypes: z.array(z.string()),
});

export type ClientSessionReplacementProgramEntry = z.infer<
    typeof clientSessionReplacementProgramEntrySchema
>;
