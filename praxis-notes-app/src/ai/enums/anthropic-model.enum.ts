import { z } from 'zod';

export const anthropicModelEnum = z.enum([
    'claude-sonnet-4-20250514',
    'claude-opus-4-20250514',
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
    'claude-3-opus-latest',
    'claude-3-haiku-20240307',
]);

export type AnthropicModel = z.infer<typeof anthropicModelEnum>;
