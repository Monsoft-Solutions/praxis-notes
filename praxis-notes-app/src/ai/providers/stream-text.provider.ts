import { Function } from '@errors/types';

import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { streamText as aiSdkStreamText, Message, smoothStream } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { thinkTool } from '../tools/think.tool';
import { AiRequest } from '../schemas/ai-request.schema';
import { getClientDataTool } from '../tools/get-client-data.tool';
import { listAvailableClientsTool } from '../tools/list-available-clients.tool';

import { v4 as uuidv4 } from 'uuid';

import { Langfuse } from 'langfuse';
import { logger } from '@logger/providers';

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

    const {
        anthropicApiKey,
        langfuseSecretKey,
        langfusePublicKey,
        langfuseBaseUrl,
    } = coreConf;

    const langfuse = new Langfuse({
        secretKey: langfuseSecretKey,
        publicKey: langfusePublicKey,
        baseUrl: langfuseBaseUrl,
    });

    const traceId = uuidv4();

    const trace = langfuse.trace({
        name: 'ai_request',
        id: traceId,
        metadata: {
            prompt,
            messages,
            modelParams,
            userName: modelParams.userBasicData?.firstName,
        },
        sessionId: traceId,
        userId: modelParams.userBasicData?.userId,
    });

    const anthropic = createAnthropic({
        apiKey: anthropicApiKey,
    });

    const model = modelParams.model;

    const generation = trace.generation({
        model,
        input: messages && messages.length > 0 ? messages : prompt,
        metadata: {
            activeTools: modelParams.activeTools,
        },
    });

    const { textStream } = aiSdkStreamText({
        model: anthropic(model),
        prompt,
        messages,
        tools: {
            think: thinkTool,
            getClientData: getClientDataTool,
            listAvailableClients: listAvailableClientsTool,
        },
        experimental_activeTools: modelParams.activeTools,
        maxSteps: 10,
        maxRetries: 3,

        experimental_transform: smoothStream(),

        onStepFinish: (step) => {
            if (step.finishReason === 'stop') {
                return;
            }

            trace.event({
                name: `event_inner_step_${step.toolCalls.length > 0 ? step.toolCalls[0].toolName : 'multiple'}`,
                metadata: {
                    stepType: step.stepType,
                    finishReason: step.finishReason,
                    modelId: step.response.modelId,
                },
                input: step.request.body,
                output: step.response.messages,
            });

            trace.generation({
                name: `update_inner_step_${step.toolCalls.length > 0 ? step.toolCalls[0].toolName : 'multiple'}`,
                model,
                input: step.request.body,
                output: step.response.messages,
                usage: {
                    input: step.usage.promptTokens,
                    output: step.usage.completionTokens,
                    total: step.usage.totalTokens,
                },
                metadata: {
                    stepType: step.stepType,
                    finishReason: step.finishReason,
                },
            });
        },
        onFinish: async (result) => {
            generation.end({
                input: messages && messages.length > 0 ? messages : prompt,
                output: result.text,
                usage: {
                    input: result.usage.promptTokens,
                    output: result.usage.completionTokens,
                    total: result.usage.totalTokens,
                },
                metadata: {
                    finishReason: result.finishReason,
                    steps: result.steps.map((step) => ({
                        type: step.stepType,
                        finishReason: step.finishReason,
                        input: step.request.body,
                        output: step.text,
                    })),
                },
            });
            await langfuse.flushAsync();
        },
        onError: (error) => {
            generation.event({
                name: 'error',
                metadata: {
                    error: error.error,
                },
            });
            logger.error(
                typeof error.error === 'string'
                    ? `Error on ai-sdk stream-text: ${error.error}`
                    : 'Error on ai-sdk stream-text',
            );
        },
    });

    const reader = textStream.getReader();
    return Success(reader);
}) satisfies Function<
    | { prompt: string; messages?: undefined; modelParams: AiRequest }
    | { prompt?: undefined; messages: Message[]; modelParams: AiRequest },
    ReadableStreamDefaultReader<string>
>;
