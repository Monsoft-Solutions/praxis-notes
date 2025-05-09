import { z } from 'zod';

export const reinforcerSchema = z.object({
    id: z.string(),
    isCustom: z.boolean(),
    name: z.string().min(1),
});

export type Reinforcer = z.infer<typeof reinforcerSchema>;
