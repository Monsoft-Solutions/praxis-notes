import { z } from 'zod';

export const transformNoteTypeSchema = z.enum([
    'improve',
    'shortenIt',
    'cleanUp',
    'makeDescriptive',
    'makeDetailed',
    'simplify',
    'makeInformative',
    'paraphrase',
    'summarize',
    'fixMistakes',
    'soundFluent',
    'makeObjective',
    'soundProfessional',
    'rewriteGeneral',
    'rewriteESL',
    'rewriteExpert',
    'createOutline',
    'moreIdeas',
    'customInstructions',
]);

export type TransformNoteType = z.infer<typeof transformNoteTypeSchema>;
