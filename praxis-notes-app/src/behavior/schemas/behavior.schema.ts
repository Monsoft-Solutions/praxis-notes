import { z } from 'zod';

export const behaviorSchema = z.object({
    id: z.string(),

    organizationId: z.string().nullable(),

    name: z.string().min(1),

    description: z.string().nullable(),
});

export type Behavior = z.infer<typeof behaviorSchema>;
