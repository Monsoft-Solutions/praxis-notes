import { z } from 'zod';

/**
 * Client intervention schema
 */
export const clientFormInterventionSchema = z.object({
    id: z.string(),

    behaviorIds: z.array(z.string()),
});

export type ClientFormIntervention = z.infer<
    typeof clientFormInterventionSchema
>;
