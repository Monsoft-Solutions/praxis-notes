import { z } from 'zod';
import { clientBehaviorTypeEnum } from '../enums/client-behavior-type.enum';

export const clientBehaviorSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    baseline: z.number(),
    type: clientBehaviorTypeEnum,
    behaviorId: z.string(),
    isCustom: z.boolean().default(false),
});

export type ClientBehavior = z.infer<typeof clientBehaviorSchema>;
