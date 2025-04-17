import { z } from 'zod';

export const behaviorSchema = z.object({
    id: z.string(),

    isCustom: z.boolean(),

    name: z.string().min(1),

    description: z.string().nullable(),
});

export type Behavior = z.infer<typeof behaviorSchema>;
