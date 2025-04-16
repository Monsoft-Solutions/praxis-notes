import { z } from 'zod';

export const locationSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
});

export type Location = z.infer<typeof locationSchema>;

export const createLocationSchema = locationSchema.omit({ id: true });
export type CreateLocation = z.infer<typeof createLocationSchema>;
