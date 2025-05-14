import { z } from 'zod';

export const transformNoteTypeSchema = z.enum([
    'improve',
    'shortenIt',
    'cleanUp',
    'makeDescriptive',
    'makeDetailed',
    'simplify',
    'summarize',
    'fixMistakes',
    'soundFluent',
    'makeObjective',
    'paraphrase',
    'rewriteGeneral',
    'rewriteESL',
    'rewriteExpert',
    'createOutline',
    'customInstructions',
]);

export type TransformNoteType = z.infer<typeof transformNoteTypeSchema>;
