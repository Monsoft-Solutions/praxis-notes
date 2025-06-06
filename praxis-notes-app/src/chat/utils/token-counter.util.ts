import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { AiModelName } from '@src/ai/enums';

// Model-specific token limits (actual limits)
const MODEL_TOKEN_LIMITS: Record<AiModelName, number> = {
    'claude-sonnet-4-20250514': 200000,
    'claude-opus-4-20250514': 200000,
    'claude-3-7-sonnet-latest': 200000,
    'claude-3-5-sonnet-latest': 200000,
    'claude-3-5-haiku-latest': 200000,
    'claude-3-opus-latest': 200000,
    'claude-3-haiku-20240307': 200000,
    'gpt-4o-2024-05-13': 128000,
    'gpt-4o-mini-2024-07-18': 128000,
};

// Recommended usage (80% of limit for safety)
const RECOMMENDED_USAGE_LIMITS: Record<AiModelName, number> = {
    'claude-sonnet-4-20250514': 160000,
    'claude-opus-4-20250514': 160000,
    'claude-3-7-sonnet-latest': 160000,
    'claude-3-5-sonnet-latest': 160000,
    'claude-3-5-haiku-latest': 160000,
    'claude-3-opus-latest': 160000,
    'claude-3-haiku-20240307': 160000,
    'gpt-4o-2024-05-13': 102400,
    'gpt-4o-mini-2024-07-18': 102400,
};

/**
 * Estimate token count for text content
 * Uses a simple approximation: ~4 characters per token for most models
 */
export const countTokens = (({ text }: { text: string }) => {
    // Basic token estimation: ~4 characters per token
    // This is a rough approximation, but sufficient for context management
    const estimatedTokens = Math.ceil(text.length / 4);

    return Success(estimatedTokens);
}) satisfies Function<{ text: string }, number>;

/**
 * Get the maximum token limit for a model
 */
export const getModelTokenLimit = (({ model }: { model: AiModelName }) => {
    const limit = MODEL_TOKEN_LIMITS[model];

    if (!limit) {
        return Error('UNKNOWN_MODEL');
    }

    return Success(limit);
}) satisfies Function<{ model: AiModelName }, number>;

/**
 * Get the recommended context limit for a model (80% of max)
 */
export const getRecommendedContextLimit = (({
    model,
}: {
    model: AiModelName;
}) => {
    const limit = RECOMMENDED_USAGE_LIMITS[model];

    if (!limit) {
        return Error('UNKNOWN_MODEL');
    }

    return Success(limit);
}) satisfies Function<{ model: AiModelName }, number>;

/**
 * Check if token count exceeds recommended limit
 */
export const exceedsRecommendedLimit = (({
    tokenCount,
    model,
}: {
    tokenCount: number;
    model: AiModelName;
}) => {
    const { data: limit, error } = getRecommendedContextLimit({ model });

    if (error) {
        return Error('UNKNOWN_MODEL');
    }

    return Success(tokenCount > limit);
}) satisfies Function<{ tokenCount: number; model: AiModelName }, boolean>;

/**
 * Calculate context utilization percentage
 */
export const calculateContextUtilization = (({
    tokenCount,
    model,
}: {
    tokenCount: number;
    model: AiModelName;
}) => {
    const { data: limit, error } = getRecommendedContextLimit({ model });

    if (error) {
        return Error('UNKNOWN_MODEL');
    }

    const utilization = Math.min((tokenCount / limit) * 100, 100);

    return Success(Math.round(utilization * 100) / 100); // Round to 2 decimal places
}) satisfies Function<{ tokenCount: number; model: AiModelName }, number>;
