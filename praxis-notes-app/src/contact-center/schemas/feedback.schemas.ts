import { z } from 'zod';

// Suggestion form validation schema
export const suggestionSchema = z.object({
    type: z.string().min(1, 'Suggestion type is required'),
    text: z.string().min(1, 'Suggestion text is required'),
});

// Bug report form validation schema
export const bugSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().min(1, 'Description is required'),
    stepsToReproduce: z.string().optional(),
    area: z.string().optional(),
    severity: z.string().optional(),
    screenshot: z.instanceof(File).optional().nullable(),
});

export type SuggestionFormValues = z.infer<typeof suggestionSchema>;
export type BugFormValues = z.infer<typeof bugSchema>;
