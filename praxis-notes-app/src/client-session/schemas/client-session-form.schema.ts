import { z } from 'zod';

import { clientSessionFormAbcEntrySchema } from './client-session-form-abc-entry.schema';

import { clientSessionValuationEnum } from '../enum';

export const clientSessionSchema = z.object({
    location: z.string(),
    sessionDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),

    valuation: clientSessionValuationEnum,
    observations: z.string(),

    presentParticipants: z.array(z.string()),
    environmentalChanges: z.array(z.string()),

    abcEntries: z.array(clientSessionFormAbcEntrySchema),
});

export type ClientSession = z.infer<typeof clientSessionSchema>;
