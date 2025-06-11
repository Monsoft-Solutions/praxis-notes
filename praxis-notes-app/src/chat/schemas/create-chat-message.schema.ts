import { z } from 'zod';

import { aiGenerationQualitySelectorSchema } from '@src/ai/schemas/ai-generation-quality-selector.schema';

import { fileSchema } from '@shared/schemas';

export const createChatMessageSchema = z.object({
    sessionId: z.string(),
    content: z.string(),
    model: aiGenerationQualitySelectorSchema.default('Smart'),
    attachments: z.array(fileSchema),
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;
