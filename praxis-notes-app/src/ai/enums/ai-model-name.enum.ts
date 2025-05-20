import { z } from 'zod';

import { anthropicModelEnum } from './anthropic-model.enum';
import { openaiModelEnum } from './open-ai-model.enum';

export const aiModelNameEnum = z.union([openaiModelEnum, anthropicModelEnum]);

export type AiModelName = z.infer<typeof aiModelNameEnum>;
