import { z } from 'zod';

export const interventionSchema = z.object({
    id: z.string(),
    isCustom: z.boolean(),
    name: z.string().min(1),
    description: z.string().nullable(),
});

export type Intervention = z.infer<typeof interventionSchema>;
