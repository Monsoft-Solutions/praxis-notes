import { z } from 'zod';

export const antecedentSchema = z.object({
    id: z.string(),
    organizationId: z.string().nullable(),
    category: z.string().max(100).optional(),
    name: z.string().min(1),
    description: z.string().optional(),
});

export type Antecedent = z.infer<typeof antecedentSchema>;
