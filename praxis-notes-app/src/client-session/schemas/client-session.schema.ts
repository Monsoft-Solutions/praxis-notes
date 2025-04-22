import { z } from 'zod';

import { clientSessionAbcEntrySchema } from './client-session-abc-entry.schema';

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

    abcEntries: z.array(clientSessionAbcEntrySchema),
});

export type ClientSession = z.infer<typeof clientSessionSchema>;
