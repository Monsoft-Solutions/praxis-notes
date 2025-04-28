import { z } from 'zod';
import { clientBehaviorTypeEnum } from '@src/behavior/enums';

/**
 * Client behavior form schema
 */
export const clientFormBehaviorSchema = z.object({
    id: z.string().min(1, 'Behavior selection is required.'),
    type: clientBehaviorTypeEnum,
    baseline: z
        .number()
        .min(0, 'Baseline must be non-negative.')
        .max(100, 'Baseline must be less than or equal to 100.'),
    isExisting: z.boolean().optional(),
});

export type ClientFormBehavior = z.infer<typeof clientFormBehaviorSchema>;
