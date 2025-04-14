import { z } from 'zod';

import { clientFormBasicInfoSchema } from './client-form-basic-info.schema';
import { clientFormBehaviorSchema } from './client-form-behavior.schema';
import { clientFormReplacementProgramSchema } from './client-form-replacement-program.schema';
import { clientFormInterventionSchema } from './client-form-intervention.schema';

/**
 * Client form data schema
 */
export const clientFormDataSchema = z.object({
    // Step 1: Basic Info
    ...clientFormBasicInfoSchema.shape,

    // Step 2: Behaviors
    behaviors: z.array(clientFormBehaviorSchema),

    // Step 3: Replacement Programs
    replacementPrograms: z.array(clientFormReplacementProgramSchema),

    // Step 4: Interventions
    interventions: z.array(clientFormInterventionSchema),
});

export type ClientFormData = z.infer<typeof clientFormDataSchema>;
