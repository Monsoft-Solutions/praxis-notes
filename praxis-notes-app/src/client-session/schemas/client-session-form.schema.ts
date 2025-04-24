import { z } from 'zod';

import { clientSessionFormAbcEntrySchema } from './client-session-form-abc-entry.schema';

import { clientSessionValuationEnum } from '../enum';
import { clientSessionFormReplacementProgramEntrySchema } from './client-session-form-replacement-program-entry.schema';

export const clientSessionFormSchema = z.object({
    location: z.string(),
    sessionDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),

    valuation: clientSessionValuationEnum,
    observations: z.string().nullable(),

    presentParticipants: z.array(z.string()),
    environmentalChanges: z.array(z.string()),

    abcIdEntries: z.array(clientSessionFormAbcEntrySchema),
    replacementProgramEntries: z.array(
        clientSessionFormReplacementProgramEntrySchema,
    ),
});

export type ClientSessionForm = z.infer<typeof clientSessionFormSchema>;
