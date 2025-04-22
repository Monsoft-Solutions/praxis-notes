import { z } from 'zod';

import { replacementProgramResponseEnum } from '@src/replacement-program/enums';

export const clientSessionFormReplacementProgramEntrySchema = z.object({
    replacementProgramId: z.string(),
    teachingProcedureId: z.string(),
    promptingProcedureId: z.string(),
    clientResponse: replacementProgramResponseEnum,
    progress: z.number(),
    promptTypesIds: z.array(z.string()),
});

export type ClientSessionFormReplacementProgramEntry = z.infer<
    typeof clientSessionFormReplacementProgramEntrySchema
>;
