import { z } from 'zod';

export const clientSessionFormAbcEntrySchema = z.object({
    antecedent: z.string(),
    behavior: z.string(),
    intervention: z.string(),
});

export type ClientSessionFormAbcEntry = z.infer<
    typeof clientSessionFormAbcEntrySchema
>;
