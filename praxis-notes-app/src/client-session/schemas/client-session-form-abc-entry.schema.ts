import { z } from 'zod';

export const clientSessionFormAbcEntrySchema = z.object({
    antecedentId: z.string(),
    behaviorId: z.string(),
    interventionId: z.string(),
});

export type ClientSessionFormAbcEntry = z.infer<
    typeof clientSessionFormAbcEntrySchema
>;
