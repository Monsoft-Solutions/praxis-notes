import { z } from 'zod';

import { generateNotesPromptInputSchema } from './generate-notes-prompt-input.schema';

import { userBasicDataForChatSchema } from '@src/chat/schemas';
import { anthropicModelEnum } from '@src/ai/enums/anthropic-model.enum';

export const generateNotesInputSchema = generateNotesPromptInputSchema
    .extend({
        userBasicData: userBasicDataForChatSchema,
    })
    .extend({
        model: anthropicModelEnum.default('claude-3-7-sonnet-latest'),
    });

export type GenerateNotesInput = z.infer<typeof generateNotesInputSchema>;
