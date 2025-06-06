import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { AiModelName, AiProviderName } from '../enums';

export const getAiProviderNameFromModelName = (({ modelName }) => {
    if (modelName.startsWith('claude-')) {
        return Success('anthropic');
    }

    if (modelName.startsWith('gpt-')) {
        return Success('openai');
    }

    return Error('INVALID_MODEL_NAME');
}) satisfies Function<{ modelName: AiModelName }, AiProviderName>;
