import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { generateNotesPrompt } from './generate-notes-prompt.provider';

import { streamText } from '@src/ai/providers';

import { GenerateNotesInput } from '@src/notes/schema';

import { consumeUserCredits } from '../../../../bases/credits/providers/server';
import {
    AnthropicModel,
    anthropicModelEnum,
} from '@src/ai/enums/anthropic-model.enum';

// Helper function to generate notes using Anthropic
const _generateNotes = (async ({
    clientData,
    sessionData,
    userBasicData,
}: GenerateNotesInput) => {
    // Use the prompt from our dedicated module
    const { data: prompt } = generateNotesPrompt({
        clientData,
        sessionData,
    });

    const { data: textStream, error: textGenerationError } = await streamText({
        prompt,
        modelParams: {
            model: 'claude-sonnet-4-20250514',
            provider: 'anthropic',
            activeTools: ['think'],
            userBasicData,
            callerName: 'generateNotes',
        },
    });

    if (textGenerationError) return Error('TEXT_GENERATION_ERROR');

    return Success(textStream);
}) satisfies Function<GenerateNotesInput, ReadableStreamDefaultReader<string>>;

export const generateNotes = (async (data: GenerateNotesInput) =>
    await consumeUserCredits({
        userId: data.userBasicData.userId,
        bucketType: 'generateNotes',
        // TODO: get the model from the settings
        amount: amountOfCreditsBasedOnModel(data.model),
        callback: async () => await _generateNotes(data),
    })) satisfies Function<
    GenerateNotesInput,
    ReadableStreamDefaultReader<string>
>;

function amountOfCreditsBasedOnModel(model: AnthropicModel) {
    switch (model) {
        case anthropicModelEnum.Enum['claude-3-7-sonnet-latest']:
            return 1;
        case anthropicModelEnum.Enum['claude-3-5-haiku-latest']:
            return 0.8;
        case anthropicModelEnum.Enum['claude-3-haiku-20240307']:
            return 0.65;
        default:
            return 1;
    }
}
