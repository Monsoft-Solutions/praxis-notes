import { z } from 'zod';

import { feedbackTypeEnum } from '../enums';

// Event sent when feedback is submitted
export const feedbackSubmittedEvent = {
    name: 'feedbackSubmitted',
    schema: z.object({
        id: z.string(),
        userId: z.string(),
        type: feedbackTypeEnum,
        text: z.string(),
        createdAt: z.number(),
    }),
} as const;
