import { z } from 'zod';

import { availableToolsEnumSchema } from '../enums/agent-tools.enum';

import {
    aiModelProviderEnum,
    anthropicModelEnum,
    openaiModelEnum,
} from '../enums';
import { userBasicDataForChatSchema } from '@src/chat/schemas';

export const aiRequestSchema = z.object({
    provider: aiModelProviderEnum,

    model: anthropicModelEnum
        .or(openaiModelEnum)
        .default('claude-3-7-sonnet-latest'),

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

    activeTools: z
        .array(availableToolsEnumSchema)
        .describe('The names of the tools available for the model')
        .optional()
        .default([]),

    userBasicData: userBasicDataForChatSchema
        .optional()
        .describe('The user basic data to log the request'),

    metadata: z
        .record(z.string(), z.any())
        .optional()
        .describe('The metadata to log the request'),

    tags: z
        .array(z.string())
        .optional()
        .describe('The tags to log the request'),

    callerName: z
        .string()
        .describe(
            'The name of the caller (method who is calling the AI generation)',
        ),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;
