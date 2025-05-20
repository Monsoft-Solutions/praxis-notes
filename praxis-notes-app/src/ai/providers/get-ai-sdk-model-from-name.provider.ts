import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { LanguageModelV1 } from 'ai';

import { AiModelName } from '../enums';

import { getAiProviderNameFromModelName } from './get-ai-provider-name-from-model-name.provider';

import { getAiSdkProviderFromName } from './get-ai-sdk-provider-from-name.provider';

export const getAiSdkModelFromName = (async ({ modelName }) => {
    const { data: providerName, error: providerNameError } =
        getAiProviderNameFromModelName({
            modelName,
        });

    if (providerNameError) return Error('INVALID_MODEL_NAME');

    const { data: provider, error: providerError } =
        await getAiSdkProviderFromName({
            providerName,
        });

    if (providerError) return Error('INVALID_MODEL_NAME');

    const model = provider(modelName);

    return Success(model);
}) satisfies Function<{ modelName: AiModelName }, LanguageModelV1>;
