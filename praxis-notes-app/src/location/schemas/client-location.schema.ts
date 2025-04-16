import { z } from 'zod';

export const clientLocationSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    locationId: z.string(),
    createdAt: z.number(),
});

export type ClientLocation = z.infer<typeof clientLocationSchema>;

export const createClientLocationSchema = z.object({
    clientId: z.string(),
    locationId: z.string(),
});

export type CreateClientLocation = z.infer<typeof createClientLocationSchema>;
