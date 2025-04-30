import { z } from 'zod';

export const feedbackTypeEnum = z.enum([
    'feature',
    'improvement',
    'ux',
    'performance',
    'other',
]);

export type FeedbackType = z.infer<typeof feedbackTypeEnum>;
