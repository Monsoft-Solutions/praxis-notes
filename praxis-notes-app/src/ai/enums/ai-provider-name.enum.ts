import { z } from 'zod';

export const aiProviderNameEnum = z.enum(['anthropic', 'openai']);

export type AiProviderName = z.infer<typeof aiProviderNameEnum>;
