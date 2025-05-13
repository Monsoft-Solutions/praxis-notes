import { z } from 'zod';

export const abcFunctionEnum = z.enum([
    'attention',
    'escape',
    'sensory',
    'tangible',
]);

// template status type
export type AbcFunction = z.infer<typeof abcFunctionEnum>;
