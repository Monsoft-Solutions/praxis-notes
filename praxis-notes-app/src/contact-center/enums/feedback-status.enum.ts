import { z } from 'zod';

export const feedbackStatusEnum = z.enum([
    'pending',
    'reviewed',
    'implemented',
    'rejected',
]);

export type FeedbackStatus = z.infer<typeof feedbackStatusEnum>;
