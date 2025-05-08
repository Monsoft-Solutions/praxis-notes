import { z } from 'zod';

export const aiGenerationQualitySelectorSchema = z.enum([
    'Fast',
    'Smart',
    'Genius',
]);

export type AiGenerationQualitySelector = z.infer<
    typeof aiGenerationQualitySelectorSchema
>;
