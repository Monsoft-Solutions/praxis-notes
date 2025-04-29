import { z } from 'zod';

export const appAreaEnum = z.enum([
    'notes',
    'auth',
    'ui',
    'sync',
    'search',
    'other',
]);

export type AppArea = z.infer<typeof appAreaEnum>;
