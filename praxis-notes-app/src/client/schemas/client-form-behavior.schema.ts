import { z } from 'zod';

/**
 * Client behavior form schema
 */
export const clientFormBehaviorSchema = z.object({
    id: z.string(),

    baseline: z.coerce.number(),

    type: z.enum(['frequency', 'percentage']),
});

export type ClientFormBehavior = z.infer<typeof clientFormBehaviorSchema>;
