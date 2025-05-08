import { z } from 'zod';

import { replacementProgramResponseEnum } from '@src/replacement-program/enums';

export const clientSessionFormReplacementProgramEntrySchema = z.object({
    replacementProgramId: z.string(),
    teachingProcedureId: z.string().nullable(),
    promptingProcedureId: z.string().nullable(),
    clientResponse: replacementProgramResponseEnum.nullable(),
    progress: z.number().nullable(),
    promptTypesIds: z.array(z.string()),
    linkedAbcEntryIndex: z.number().nullable().optional(),
});

export type ClientSessionFormReplacementProgramEntry = z.infer<
    typeof clientSessionFormReplacementProgramEntrySchema
>;
