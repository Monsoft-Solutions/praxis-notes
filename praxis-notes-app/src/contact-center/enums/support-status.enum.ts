import { z } from 'zod';

export const supportStatusEnum = z.enum(['pending', 'in-progress', 'resolved']);

export type SupportStatus = z.infer<typeof supportStatusEnum>;
