import { Function } from '@errors/types';

import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { streamText as aiSdkStreamText, Message, smoothStream } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { thinkTool } from '../tools/think.tool';
import { AiRequest } from '../type/ai-request.type';
import { getClientDataTool } from '../tools/get-client-data.tool';
import { listAvailableClientsTool } from '../tools/list-available-clients.tool';

export const streamText = (async ({
    prompt,
    messages,
    modelParams,
}:
    | {
          prompt: string;
          messages?: undefined;
          modelParams: AiRequest;
      }
    | {
          prompt?: undefined;
          messages: Message[];
          modelParams: AiRequest;
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

    const model = modelParams.model;

    const { textStream } = aiSdkStreamText({
        model: anthropic(model),
        prompt,
        messages,
        tools: {
            think: thinkTool,
            getClientData: getClientDataTool,
            listAvailableClients: listAvailableClientsTool,
        },
        experimental_activeTools: modelParams.active_tools,
        maxSteps: 10,
        maxRetries: 3,

        experimental_transform: smoothStream(),
    });

    const reader = textStream.getReader();
    return Success(reader);
}) satisfies Function<
    | { prompt: string; messages?: undefined; modelParams: AiRequest }
    | { prompt?: undefined; messages: Message[]; modelParams: AiRequest },
    ReadableStreamDefaultReader<string>
>;
