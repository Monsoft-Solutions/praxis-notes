import { z } from 'zod';

export const antecedentSchema = z.object({
    id: z.string(),
    isCustom: z.boolean(),
    name: z.string().min(1),
    description: z.string().optional(),
});

export type Antecedent = z.infer<typeof antecedentSchema>;
