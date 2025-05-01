import { z } from 'zod';

import { clientBehaviorSchema } from '@src/behavior/schemas';
import { clientReplacementProgramSchema } from '@src/replacement-program/schemas';
import { clientInterventionSchema } from '@src/intervention/schemas';

export const clientAbaDataSchema = z.object({
    behaviors: z.array(clientBehaviorSchema),
    replacementPrograms: z.array(clientReplacementProgramSchema),
    interventions: z.array(clientInterventionSchema),
});

export type ClientAbaData = z.infer<typeof clientAbaDataSchema>;
