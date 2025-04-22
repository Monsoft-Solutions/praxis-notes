import { z } from 'zod';

import { abcFunctionEnum } from '@src/client-session/enum';

export const clientSessionFormAbcEntrySchema = z.object({
    antecedentId: z.string(),
    behaviorIds: z.array(z.string()),
    interventionIds: z.array(z.string()),
    function: abcFunctionEnum,
});

export type ClientSessionFormAbcEntry = z.infer<
    typeof clientSessionFormAbcEntrySchema
>;
