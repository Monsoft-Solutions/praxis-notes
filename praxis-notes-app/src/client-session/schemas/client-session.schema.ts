import { z } from 'zod';

import { clientSessionAbcEntrySchema } from './client-session-abc-entry.schema';

import { clientSessionValuationEnum } from '../enum';

import { clientSessionReplacementProgramEntrySchema } from './client-session-replacement-program-entry.schema';

export const clientSessionSchema = z.object({
    location: z.string(),
    sessionDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),

    valuation: clientSessionValuationEnum,
    observations: z.string().nullable(),

    presentParticipants: z.array(z.string()),
    environmentalChanges: z.array(z.string()),

    abcEntries: z.array(clientSessionAbcEntrySchema),

    replacementProgramEntries: z.array(
        clientSessionReplacementProgramEntrySchema,
    ),

    userInitials: z.string(),
    clientInitials: z.string(),

    notes: z.string().nullable(),
});

export type ClientSession = z.infer<typeof clientSessionSchema>;
