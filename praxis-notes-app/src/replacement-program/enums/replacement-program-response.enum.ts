import { z } from 'zod';

export const replacementProgramResponseEnum = z.enum([
    'expected',
    'exceeded',
    'delayed',
]);

export type ReplacementProgramResponse = z.infer<
    typeof replacementProgramResponseEnum
>;
