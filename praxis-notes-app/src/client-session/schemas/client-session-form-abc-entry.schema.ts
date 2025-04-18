import { z } from 'zod';

export const clientSessionFormAbcEntrySchema = z.object({
    antecedentId: z.string(),
    behaviorIds: z.array(z.string()),
    interventionIds: z.array(z.string()),
});

export type ClientSessionFormAbcEntry = z.infer<
    typeof clientSessionFormAbcEntrySchema
>;
