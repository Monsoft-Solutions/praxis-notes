import { z } from 'zod';

import { aiGenerationQualitySelectorSchema } from '@src/ai/schemas/ai-generation-quality-selector.schema';

export const createChatMessageSchema = z.object({
    sessionId: z.string(),
    content: z.string(),
    model: aiGenerationQualitySelectorSchema.default('Smart'),
});

export type CreateChatMessage = z.infer<typeof createChatMessageSchema>;
