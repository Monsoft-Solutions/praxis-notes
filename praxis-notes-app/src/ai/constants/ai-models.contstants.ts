import { z } from 'zod';

export const aiModelProviderSchema = z.enum(['anthropic', 'openai']);

export const anthropicModels = z.enum([
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
    'claude-3-opus-latest',
    'claude-3-haiku-20240307',
]);

export const openaiModels = z.enum([
    'gpt-4o-2024-05-13',
    'gpt-4o-mini-2024-07-18',
]);
