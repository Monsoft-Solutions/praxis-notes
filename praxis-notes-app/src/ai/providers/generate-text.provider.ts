import { Function } from '@errors/types';

import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { generateText as aiSdkGenerateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { deploymentEnv } from '@env/constants/deployment-env.constant';

export const generateText = (async ({ prompt }: { prompt: string }) => {
    // get the core configuration
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { anthropicApiKey } = coreConf;

    const anthropic = createAnthropic({
        apiKey: anthropicApiKey,
    });

    type AnthropicModel = Parameters<typeof anthropic>[0];

    const model: AnthropicModel =
        deploymentEnv.MSS_DEPLOYMENT_TYPE === 'production'
            ? 'claude-3-5-haiku-20241022'
            : 'claude-3-haiku-20240307';

    const { data: textGenerationData, error: textGenerationError } =
        await catchError(
            aiSdkGenerateText({
                model: anthropic(model),
                prompt,
            }),
        );

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    const { text } = textGenerationData;

    return Success(text);
}) satisfies Function<{ prompt: string }, string>;
