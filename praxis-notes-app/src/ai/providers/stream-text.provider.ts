import { Function } from '@errors/types';

import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import { streamText as aiSdkStreamText, CoreMessage, smoothStream } from 'ai';

import { getAiSdkModelFromName } from './get-ai-sdk-model-from-name.provider';

import { thinkTool } from '../tools/think.tool';
import { AiRequest } from '../schemas/ai-request.schema';
import { getClientDataTool } from '../tools/get-client-data.tool';
import { listAvailableClientsTool } from '../tools/list-available-clients.tool';

import { v4 as uuidv4 } from 'uuid';

import { Langfuse } from 'langfuse';
import { logger } from '@logger/providers';

import { getAiProviderNameFromModelName } from './get-ai-provider-name-from-model-name.provider';
import { createClientTool } from '../tools/create-client.tool';
import { listInterventionsTool } from '../tools/list-interventions.tool';
import { listSystemBehaviorsTool } from '../tools/list-system-behaviors.tool';
import { listReinforcersTool } from '../tools/list-reinforcers.tool';
import { listReplacementProgramsTool } from '../tools/list-replacement-programs.tool';
import { createReplacementProgramTool } from '../tools/create-replacement-program.tool';
import { createAntecedentTool } from '../tools/create-antecedent.tool';
import { createInterventionTool } from '../tools/create-intervention.tool';
import { createBehaviorTool } from '../tools/create-behavior.tool';
import { createReinforcerTool } from '../tools/create-reinforcer.tool';

let langfuse: Langfuse | undefined;

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
          messages: CoreMessage[];
          modelParams: AiRequest;
      }) => {
    const traceId = uuidv4();

    // get the core configuration
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { langfuseSecretKey, langfusePublicKey, langfuseBaseUrl } = coreConf;

    if (!langfuse) {
        initLangfuse({
            langfuseSecretKey,
            langfusePublicKey,
            langfuseBaseUrl,
        });
    }

    const { data: providerName, error: providerNameError } =
        getAiProviderNameFromModelName({
            modelName: modelParams.model,
        });

    if (providerNameError) return Error('INVALID_MODEL_NAME');

    const modelName = modelParams.model;

    const trace = langfuse?.trace({
        name: modelParams.callerName,
        id: traceId,
        metadata: {
            prompt,
            messages,
            modelParams,
        },
        sessionId: modelParams.chatSessionId,
        userId: modelParams.userBasicData?.userId,
        tags: [modelName, providerName, modelParams.callerName],
    });

    const generation = trace?.generation({
        model: modelName,
        input: messages && messages.length > 0 ? messages : prompt,
        metadata: {
            activeTools: modelParams.activeTools,
        },
    });

    const cleanMessages = messages?.filter(
        (message) => message.content.length > 0,
    );

    const { data: model, error: modelError } = await getAiSdkModelFromName({
        modelName,
    });

    if (modelError) return Error('INVALID_MODEL_NAME');

    const { textStream } = aiSdkStreamText({
        model,
        prompt,
        messages: cleanMessages,
        tools: {
            think: thinkTool,
            getClientData: getClientDataTool,
            listAvailableClients: listAvailableClientsTool,
            createClient: createClientTool,
            listSystemBehaviors: listSystemBehaviorsTool,
            listReinforcers: listReinforcersTool,
            listReplacementPrograms: listReplacementProgramsTool,
            listInterventions: listInterventionsTool,
            createAntecedent: createAntecedentTool,
            createBehavior: createBehaviorTool,
            createIntervention: createInterventionTool,
            createReplacementProgram: createReplacementProgramTool,
            createReinforcer: createReinforcerTool,
        },
        experimental_activeTools: modelParams.activeTools,
        maxSteps: 25,
        maxRetries: 3,

        experimental_transform: smoothStream(),

        onStepFinish: (step) => {
            if (step.finishReason === 'stop' || step.toolCalls.length === 0) {
                return;
            }

            trace?.event({
                name: `event_inner_step_${
                    step.toolCalls.length
                        ? step.toolCalls[0].toolName
                        : 'no_tool'
                }`,
                metadata: {
                    stepType: step.stepType,
                    finishReason: step.finishReason,
                    modelId: step.response.modelId,
                },
                input: step.request.body,
                output: step.response.messages,
            });
        },
        onFinish: async (result) => {
            generation?.end({
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
            await langfuse?.flushAsync();
        },
        onError: async (error) => {
            trace?.event({
                name: 'error',
                metadata: {
                    error: error.error,
                },
            });
            trace?.update({
                metadata: {
                    error: error.error,
                },
                tags: ['error'],
            });
            generation?.end({
                metadata: {
                    error: error.error,
                },
            });
            logger.error(
                typeof error.error === 'string'
                    ? `Error on ai-sdk stream-text: ${error.error}`
                    : 'Error on ai-sdk stream-text',
            );
            await langfuse?.flushAsync();
        },
    });

    const reader = textStream.getReader();
    return Success(reader);
}) satisfies Function<
    | { prompt: string; messages?: undefined; modelParams: AiRequest }
    | { prompt?: undefined; messages: CoreMessage[]; modelParams: AiRequest },
    ReadableStreamDefaultReader<string>
>;

const initLangfuse = ({
    langfuseSecretKey,
    langfusePublicKey,
    langfuseBaseUrl,
}: {
    langfuseSecretKey: string;
    langfusePublicKey: string;
    langfuseBaseUrl: string;
}) => {
    if (langfuse) return;
    langfuse = new Langfuse({
        secretKey: langfuseSecretKey,
        publicKey: langfusePublicKey,
        baseUrl: langfuseBaseUrl,
    });
};
