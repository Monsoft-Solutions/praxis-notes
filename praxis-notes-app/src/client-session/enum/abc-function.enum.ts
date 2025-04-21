import { z } from 'zod';

export const abcFunctionEnum = z.enum([
    'atention',
    'escape',
    'sensory',
    'tangible',
]);

// template status type
export type AbcFunction = z.infer<typeof abcFunctionEnum>;
