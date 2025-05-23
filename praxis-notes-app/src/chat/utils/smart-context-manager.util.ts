import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';
import { countTokens, getRecommendedContextLimit } from './token-counter.util';
import {
    calculateMessageImportance,
    MessageImportanceResult,
} from './message-importance-scorer.util';

export type MessageWithMetadata = ChatMessage & {
    tokenCount: number;
    importanceScore: number;
    importanceFactors: MessageImportanceResult['factors'];
};

export type ContextSelectionResult = {
    selectedMessages: MessageWithMetadata[];
    totalTokens: number;
    totalMessages: number;
    droppedMessages: number;
    contextUtilization: number;
    averageImportanceScore: number;
    selectionStrategy:
        | 'all'
        | 'importance-based'
        | 'sliding-window'
        | 'emergency-truncation';
};

/**
 * Select optimal messages for AI context within token limits
 */
export const selectOptimalContext = (({
    messages,
    model,
    forceIncludeRecent = 3,
}: {
    messages: ChatMessage[];
    model: AiModelName;
    forceIncludeRecent?: number;
}) => {
    // Get token limit for the model
    const { data: tokenLimit, error: tokenLimitError } =
        getRecommendedContextLimit({ model });

    if (tokenLimitError) {
        return Error('INVALID_MODEL');
    }

    // Calculate metadata for all messages
    const messagesWithMetadata: MessageWithMetadata[] = [];

    for (const message of messages) {
        const { data: tokenCount } = countTokens({ text: message.content });
        const { data: importanceResult } = calculateMessageImportance({
            message,
            allMessages: messages,
        });

        messagesWithMetadata.push({
            ...message,
            tokenCount,
            importanceScore: importanceResult.score,
            importanceFactors: importanceResult.factors,
        });
    }

    // Calculate total tokens if we include all messages
    const totalTokens = messagesWithMetadata.reduce(
        (sum, msg) => sum + msg.tokenCount,
        0,
    );

    // If all messages fit within limits, return them all
    if (totalTokens <= tokenLimit) {
        return Success({
            selectedMessages: messagesWithMetadata,
            totalTokens,
            totalMessages: messagesWithMetadata.length,
            droppedMessages: 0,
            contextUtilization: (totalTokens / tokenLimit) * 100,
            averageImportanceScore:
                calculateAverageImportance(messagesWithMetadata),
            selectionStrategy: 'all' as const,
        });
    }

    // Try importance-based selection
    const importanceBasedResult = selectByImportance({
        messages: messagesWithMetadata,
        tokenLimit,
        forceIncludeRecent,
    });

    if (importanceBasedResult.selectedMessages.length > 0) {
        return Success({
            ...importanceBasedResult,
            selectionStrategy: 'importance-based' as const,
        });
    }

    // Fall back to sliding window (most recent messages)
    const slidingWindowResult = selectBySlidingWindow({
        messages: messagesWithMetadata,
        tokenLimit,
    });

    if (slidingWindowResult.selectedMessages.length > 0) {
        return Success({
            ...slidingWindowResult,
            selectionStrategy: 'sliding-window' as const,
        });
    }

    // Emergency: truncate even the most recent message if necessary
    const emergencyResult = emergencyTruncation({
        messages: messagesWithMetadata,
        tokenLimit,
    });

    return Success({
        ...emergencyResult,
        selectionStrategy: 'emergency-truncation' as const,
    });
}) satisfies Function<
    {
        messages: ChatMessage[];
        model: AiModelName;
        forceIncludeRecent?: number;
    },
    ContextSelectionResult
>;

/**
 * Select messages based on importance score, ensuring recent messages are included
 */
function selectByImportance({
    messages,
    tokenLimit,
    forceIncludeRecent,
}: {
    messages: MessageWithMetadata[];
    tokenLimit: number;
    forceIncludeRecent: number;
}): Omit<ContextSelectionResult, 'selectionStrategy'> {
    // Sort messages by creation time (newest first)
    const sortedByTime = [...messages].sort(
        (a, b) => b.createdAt - a.createdAt,
    );

    // Force include the most recent messages
    const forcedMessages = sortedByTime.slice(0, forceIncludeRecent);
    const remainingMessages = sortedByTime.slice(forceIncludeRecent);

    // Calculate tokens used by forced messages
    const forcedTokens = forcedMessages.reduce(
        (sum, msg) => sum + msg.tokenCount,
        0,
    );

    // If forced messages already exceed limit, fall back to sliding window
    if (forcedTokens > tokenLimit) {
        return selectBySlidingWindow({ messages, tokenLimit });
    }

    // Sort remaining messages by importance score (highest first)
    const sortedByImportance = remainingMessages.sort(
        (a, b) => b.importanceScore - a.importanceScore,
    );

    // Add messages by importance until we hit the token limit
    const selectedMessages = [...forcedMessages];
    let currentTokens = forcedTokens;

    for (const message of sortedByImportance) {
        if (currentTokens + message.tokenCount <= tokenLimit) {
            selectedMessages.push(message);
            currentTokens += message.tokenCount;
        }
    }

    // Sort selected messages back to chronological order
    const finalMessages = selectedMessages.sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    return {
        selectedMessages: finalMessages,
        totalTokens: currentTokens,
        totalMessages: finalMessages.length,
        droppedMessages: messages.length - finalMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalMessages),
    };
}

/**
 * Select messages using sliding window (most recent first)
 */
function selectBySlidingWindow({
    messages,
    tokenLimit,
}: {
    messages: MessageWithMetadata[];
    tokenLimit: number;
}): Omit<ContextSelectionResult, 'selectionStrategy'> {
    // Sort messages by creation time (newest first)
    const sortedMessages = [...messages].sort(
        (a, b) => b.createdAt - a.createdAt,
    );

    const selectedMessages: MessageWithMetadata[] = [];
    let currentTokens = 0;

    // Add messages from most recent until we hit the limit
    for (const message of sortedMessages) {
        if (currentTokens + message.tokenCount <= tokenLimit) {
            selectedMessages.push(message);
            currentTokens += message.tokenCount;
        } else {
            break;
        }
    }

    // Sort selected messages back to chronological order
    const finalMessages = selectedMessages.sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    return {
        selectedMessages: finalMessages,
        totalTokens: currentTokens,
        totalMessages: finalMessages.length,
        droppedMessages: messages.length - finalMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalMessages),
    };
}

/**
 * Emergency truncation: take the most recent message and truncate if necessary
 */
function emergencyTruncation({
    messages,
    tokenLimit,
}: {
    messages: MessageWithMetadata[];
    tokenLimit: number;
}): Omit<ContextSelectionResult, 'selectionStrategy'> {
    if (messages.length === 0) {
        return {
            selectedMessages: [],
            totalTokens: 0,
            totalMessages: 0,
            droppedMessages: 0,
            contextUtilization: 0,
            averageImportanceScore: 0,
        };
    }

    // Get the most recent message
    const mostRecent = messages.reduce((latest, msg) =>
        msg.createdAt > latest.createdAt ? msg : latest,
    );

    // If even the most recent message is too large, truncate its content
    if (mostRecent.tokenCount > tokenLimit) {
        // Truncate content to fit within token limit (rough approximation)
        const maxChars = tokenLimit * 4; // ~4 chars per token
        const truncatedContent =
            mostRecent.content.substring(0, maxChars) + '...';
        const { data: truncatedTokens } = countTokens({
            text: truncatedContent,
        });

        const truncatedMessage: MessageWithMetadata = {
            ...mostRecent,
            content: truncatedContent,
            tokenCount: truncatedTokens,
        };

        return {
            selectedMessages: [truncatedMessage],
            totalTokens: truncatedTokens,
            totalMessages: 1,
            droppedMessages: messages.length - 1,
            contextUtilization: (truncatedTokens / tokenLimit) * 100,
            averageImportanceScore: truncatedMessage.importanceScore,
        };
    }

    return {
        selectedMessages: [mostRecent],
        totalTokens: mostRecent.tokenCount,
        totalMessages: 1,
        droppedMessages: messages.length - 1,
        contextUtilization: (mostRecent.tokenCount / tokenLimit) * 100,
        averageImportanceScore: mostRecent.importanceScore,
    };
}

/**
 * Calculate average importance score for a set of messages
 */
function calculateAverageImportance(messages: MessageWithMetadata[]): number {
    if (messages.length === 0) return 0;

    const totalScore = messages.reduce(
        (sum, msg) => sum + msg.importanceScore,
        0,
    );
    return Math.round((totalScore / messages.length) * 100) / 100; // Round to 2 decimal places
}
