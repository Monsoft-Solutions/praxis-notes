import { Function } from '@errors/types';

import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { generateText as aiSdkGenerateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

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

    const { data: textGenerationData, error: textGenerationError } =
        await catchError(
            aiSdkGenerateText({
                model: anthropic('claude-3-7-sonnet-latest'),
                prompt,
            }),
        );

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    const { text } = textGenerationData;

    return Success(text);
}) satisfies Function<{ prompt: string }, string>;
