import { z } from 'zod';

import { anthropicModelEnum } from './anthropic-model.enum';
import { openaiModelEnum } from './open-ai-model.enum';

export const modelNameEnum = z.union([openaiModelEnum, anthropicModelEnum]);

export type ModelName = z.infer<typeof modelNameEnum>;
