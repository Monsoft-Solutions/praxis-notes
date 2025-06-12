import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { AiProviderName } from '../enums';

import { getCoreConf } from '@conf/providers/server';

import { AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';

export const getAiSdkProviderFromName = (async ({ providerName }) => {
    // get the core configuration
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { anthropicApiKey, openaiApiKey } = coreConf;

    switch (providerName) {
        case 'anthropic':
            return Success(createAnthropic({ apiKey: anthropicApiKey }));

        case 'openai':
            return Success(createOpenAI({ apiKey: openaiApiKey }));

        default:
            return Error('INVALID_MODEL_NAME');
    }
}) satisfies Function<
    { providerName: AiProviderName },
    AnthropicProvider | OpenAIProvider
>;
