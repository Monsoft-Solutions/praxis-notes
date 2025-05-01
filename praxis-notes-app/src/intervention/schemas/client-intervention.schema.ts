import { z } from 'zod';

export const clientInterventionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isCustom: z.boolean().default(false),
    interventionId: z.string(),
    behaviors: z.array(z.string()),
});

export type ClientIntervention = z.infer<typeof clientInterventionSchema>;
