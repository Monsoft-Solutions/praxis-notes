import { z } from 'zod';
import { availableToolsEnumSchema } from '../tools/available-tools.tool';
import { aiModelProviderSchema } from '../constants/ai-models.contstants';
import { openaiModels } from '../constants/ai-models.contstants';
import { anthropicModels } from '../constants/ai-models.contstants';

export const aiRequestSchema = z.object({
    provider: aiModelProviderSchema,
    model: anthropicModels.or(openaiModels).default('claude-3-7-sonnet-latest'),
    maxTokens: z.number().describe('The max tokens of the model').optional(),
    temperature: z.number().describe('The temperature of the model').optional(),
    topP: z.number().describe('The top p of the model').optional(),
    frequencyPenalty: z
        .number()
        .describe('The frequency penalty of the model')
        .optional(),
    presencePenalty: z
        .number()
        .describe('The presence penalty of the model')
        .optional(),
    stream: z.boolean().describe('Whether to stream the response').optional(),
    active_tools: z
        .array(availableToolsEnumSchema)
        .describe('The names of the tools available for the model')
        .optional()
        .default([]),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;
