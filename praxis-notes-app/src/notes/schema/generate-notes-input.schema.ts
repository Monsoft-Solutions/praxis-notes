import { z } from 'zod';

import { generateNotesPromptInputSchema } from './generate-notes-prompt-input.schema';

import { userBasicDataForChatSchema } from '@src/chat/schemas';

export const generateNotesInputSchema = generateNotesPromptInputSchema.extend({
    userBasicData: userBasicDataForChatSchema,
});

export type GenerateNotesInput = z.infer<typeof generateNotesInputSchema>;
