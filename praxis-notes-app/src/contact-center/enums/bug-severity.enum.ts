import { z } from 'zod';

export const bugSeverityEnum = z.enum(['critical', 'high', 'medium', 'low']);

export type BugSeverity = z.infer<typeof bugSeverityEnum>;
