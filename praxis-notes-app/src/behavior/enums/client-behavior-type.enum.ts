import { z } from 'zod';

export const clientBehaviorTypeEnum = z.enum(['frequency', 'percentage']);

export type ClientBehaviorType = z.infer<typeof clientBehaviorTypeEnum>;
