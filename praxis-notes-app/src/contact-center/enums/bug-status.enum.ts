import { z } from 'zod';

export const bugStatusEnum = z.enum([
    'pending',
    'investigating',
    'fixed',
    'rejected',
]);

export type BugStatus = z.infer<typeof bugStatusEnum>;
