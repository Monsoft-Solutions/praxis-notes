import { z } from 'zod';

export const clientSessionAbcEntrySchema = z.object({
    antecedentName: z.string(),
    behaviorName: z.string(),
    interventionName: z.string(),
});

export type ClientSessionAbcEntry = z.infer<typeof clientSessionAbcEntrySchema>;
