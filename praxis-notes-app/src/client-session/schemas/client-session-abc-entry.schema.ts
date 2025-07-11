import { z } from 'zod';

export const clientSessionAbcEntrySchema = z.object({
    antecedentName: z.string(),
    behaviorNames: z.array(z.string()),
    interventionNames: z.array(z.string()),
    id: z.string().nullable(),
    function: z.string(),
});

export type ClientSessionAbcEntry = z.infer<typeof clientSessionAbcEntrySchema>;
