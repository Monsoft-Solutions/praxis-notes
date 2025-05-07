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

    const langfuse = new Langfuse({
        secretKey: langfuseSecretKey,
        publicKey: langfusePublicKey,
        baseUrl: langfuseBaseUrl,
    });

    const traceId = uuidv4();

    const trace = langfuse.trace({
        name: 'generate_object',
        id: traceId,
        metadata: {
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

    if (error) return Error('AI_GENERATE_OBJECT_FAILED');

    generation.end({
        input: prompt,
        output: result.object,
        usage: {
            input: result.usage.promptTokens,
            output: result.usage.completionTokens,
            total: result.usage.totalTokens,
        },
    });

    await langfuse.flushAsync();

    return Success(result.object);
}) satisfies Function<
    {
        prompt: string;
        modelParams: AiRequest;
        outputSchema: ZodSchema;
    },
    GenerateObjectResult<unknown>['object']
>;
