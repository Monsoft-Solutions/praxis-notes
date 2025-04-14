import { z } from 'zod';

import { clientFormDataSchema } from './client-form-data.schema';

/**
 * Complete client form schema
 */
export const clientFormSchema = clientFormDataSchema.and(
    z.object({
        // Form progression
        currentStep: z.number(),
        isComplete: z.boolean(),
    }),
);

export type ClientForm = z.infer<typeof clientFormSchema>;
