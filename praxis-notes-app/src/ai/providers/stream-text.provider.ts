import { Function } from '@errors/types';

import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { streamText as aiSdkStreamText, Message } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { deploymentEnv } from '@env/constants/deployment-env.constant';
import { thinkTool } from '../tools/think.tool';

export const streamText = (async ({
    prompt,
    messages,
}:
    | {
          prompt: string;
          messages?: undefined;
      }
    | {
          prompt?: undefined;
          messages: Message[];
      }) => {
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
            ? 'claude-3-7-sonnet-latest'
            : 'claude-3-7-sonnet-latest';

    const { textStream } = aiSdkStreamText({
        model: anthropic(model),
        prompt,
        messages,
        tools: {
            think: thinkTool,
        },
        maxSteps: 5,
        maxRetries: 3,
    });

    const reader = textStream.getReader();

    return Success(reader);
}) satisfies Function<{ prompt: string }, ReadableStreamDefaultReader<string>>;
