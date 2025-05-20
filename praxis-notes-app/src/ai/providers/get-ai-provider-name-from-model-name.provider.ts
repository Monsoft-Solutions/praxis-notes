import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { ModelName, AiProviderName } from '../enums';

export const getAiProviderNameFromModelName = (({ modelName }) => {
    switch (modelName) {
        case 'claude-3-7-sonnet-latest':
        case 'claude-3-5-sonnet-latest':
        case 'claude-3-5-haiku-latest':
        case 'claude-3-opus-latest':
        case 'claude-3-haiku-20240307':
            return Success('anthropic');

        case 'gpt-4o-2024-05-13':
        case 'gpt-4o-mini-2024-07-18':
            return Success('openai');

        default:
            return Error('INVALID_MODEL_NAME');
    }
}) satisfies Function<{ modelName: ModelName }, AiProviderName>;
