import { Function } from '@errors/types';

import { Error, Success } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';

import {
    generateObject as aiSdkGenerateObject,
    GenerateObjectResult,
} from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { AiRequest } from '../schemas/ai-request.schema';

import { v4 as uuidv4 } from 'uuid';

import { Langfuse } from 'langfuse';
import { ZodSchema } from 'zod';
import { catchError } from '@errors/utils/catch-error.util';

let langfuse: Langfuse | undefined;

export const generateObject = (async ({
    prompt,
    modelParams,
    outputSchema,
}: {
    prompt: string;
    messages?: undefined;
    modelParams: AiRequest;
    outputSchema: ZodSchema;
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

    if (!langfuse) {
        initLangfuse({
            langfuseSecretKey,
            langfusePublicKey,
            langfuseBaseUrl,
        });
    }

    const traceId = uuidv4();

    const trace = langfuse?.trace({
        name: modelParams.callerName,
        id: traceId,
        metadata: {
            modelParams,
        },
        sessionId: modelParams.chatSessionId ?? traceId,
        userId: modelParams.userBasicData?.userId,
        tags: [modelParams.model, modelParams.provider, modelParams.callerName],
    });

    if (modelParams.provider !== 'anthropic') {
        return Error('PROVIDER_NOT_SUPPORTED');
    }

    const anthropic = createAnthropic({
        apiKey: anthropicApiKey,
    });

    const model = modelParams.model;

    const generation = trace?.generation({
        model,
        input: prompt,
        metadata: {
            userBasicData: modelParams.userBasicData,
        },
    });

    const { data: result, error } = await catchError(
        aiSdkGenerateObject({
            model: anthropic(model),
            prompt,
            schema: outputSchema,
        }),
    );

    if (error) {
        generation?.end({
            input: prompt,
            output: `Error: ${String(error)}`,
            metadata: {
                error: String(error),
            },
        });
        await langfuse?.flushAsync();
        return Error('AI_GENERATE_OBJECT_FAILED');
    }

    generation?.end({
        input: prompt,
        output: result.object,
        usage: {
            input: result.usage.promptTokens,
            output: result.usage.completionTokens,
            total: result.usage.totalTokens,
        },
    });

    await langfuse?.flushAsync();

    return Success(result.object);
}) satisfies Function<
    {
        prompt: string;
        modelParams: AiRequest;
        outputSchema: ZodSchema;
    },
    GenerateObjectResult<unknown>['object']
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
