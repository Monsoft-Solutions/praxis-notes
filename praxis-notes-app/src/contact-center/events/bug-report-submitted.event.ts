import { z } from 'zod';

import { appAreaEnum, bugSeverityEnum } from '../enums';

// Event sent when a bug report is submitted
export const bugReportSubmittedEvent = {
    name: 'bugReportSubmitted',
    schema: z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string(),
        stepsToReproduce: z.string().optional(),
        area: appAreaEnum.optional(),
        severity: bugSeverityEnum.optional(),
        screenshotPath: z.string().optional(),
        createdAt: z.number(),
    }),
} as const;
