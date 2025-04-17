import { z } from 'zod';

export const clientSessionFormAbcEntrySchema = z.object({
    antecedentId: z.string(),
    clientBehaviorId: z.string(),
    clientInterventionId: z.string(),
});

export type ClientSessionFormAbcEntry = z.infer<
    typeof clientSessionFormAbcEntrySchema
>;
