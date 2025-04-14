import { z } from 'zod';

export const clientSessionValuationEnum = z.enum(['fair', 'good', 'poor']);

export type ClientSessionValuation = z.infer<typeof clientSessionValuationEnum>;
