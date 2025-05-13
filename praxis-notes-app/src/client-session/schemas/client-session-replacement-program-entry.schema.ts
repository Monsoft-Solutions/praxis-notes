import { z } from 'zod';

export const clientSessionReplacementProgramEntrySchema = z.object({
    replacementProgram: z.string(),
    teachingProcedure: z.string().nullable(),
    promptingProcedure: z.string().nullable(),
    promptTypes: z.array(z.string()),
    clientResponse: z.string().nullable(),
    progress: z.number().nullable(),
    linkedAbcEntryId: z.string().nullable().optional(),
});

export type ClientSessionReplacementProgramEntry = z.infer<
    typeof clientSessionReplacementProgramEntrySchema
>;
