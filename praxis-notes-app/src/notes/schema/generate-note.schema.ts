import { z } from 'zod';

import { clientSessionSchema } from '@src/client-session/schemas';
import { clientAbaDataSchema } from '@src/client-session/schemas/client-aba-data.schema';

export const generateNoteSchema = z.object({
    sessionData: clientSessionSchema,
    clientData: clientAbaDataSchema,
});

export type GenerateNoteSchema = z.infer<typeof generateNoteSchema>;
