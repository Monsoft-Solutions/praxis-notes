import { z } from 'zod';

import { clientSessionSchema } from '@src/client-session/schemas';
import { clientAbaDataSchema } from '@src/client-session/schemas/client-aba-data.schema';
import { userBasicDataForChatSchema } from '@src/chat/schemas';
export const generateNotesInputSchema = z.object({
    sessionData: clientSessionSchema,
    clientData: clientAbaDataSchema,
    userBasicData: userBasicDataForChatSchema.optional(),
});

export type GenerateNotesInput = z.infer<typeof generateNotesInputSchema>;
