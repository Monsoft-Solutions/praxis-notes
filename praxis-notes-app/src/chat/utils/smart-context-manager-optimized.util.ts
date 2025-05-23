import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';
import { countTokens, getRecommendedContextLimit } from './token-counter.util';
import {
    calculateMessageImportance,
    MessageImportanceResult,
} from './message-importance-scorer.util';
import { ConversationSummary } from './conversation-summarizer.util';

export type MessageWithMetadata = ChatMessage & {
    tokenCount: number;
    importanceScore: number;
    importanceFactors: MessageImportanceResult['factors'];
};

export type SummaryWithMetadata = ConversationSummary & {
    tokenCount: number;
    type: 'summary';
    // Convert to message-like structure for unified processing
    content: string;
    role: 'system';
    createdAt: number;
    id: string;
    sessionId: string;
    attachments: never[];
    importanceScore: number;
    importanceFactors: MessageImportanceResult['factors'];
};

export type ContextItemWithMetadata = MessageWithMetadata | SummaryWithMetadata;

export type OptimizedContextSelectionResult = {
    selectedItems: ContextItemWithMetadata[];
    selectedMessages: MessageWithMetadata[];
    selectedSummaries: SummaryWithMetadata[];
    totalTokens: number;
    totalMessages: number;
    totalSummaries: number;
    droppedMessages: number;
    contextUtilization: number;
    averageImportanceScore: number;
    tokensSavedBySummaries: number;
    selectionStrategy:
        | 'all'
        | 'importance-based-optimized'
        | 'sliding-window-optimized'
        | 'summaries-only'
        | 'emergency-truncation';
    optimizationUsed: boolean;
};

/**
 * Optimized context selection that works with pre-filtered messages and summaries
 * This version assumes messages are already filtered to exclude those covered by summaries
 */
export const selectOptimalContextOptimized = (({
    messages,
    summaries,
    model,
    forceIncludeRecent = 3,
    tokensSavedBySummaries = 0,
}: {
    messages: ChatMessage[];
    summaries: ConversationSummary[];
    model: AiModelName;
    forceIncludeRecent?: number;
    tokensSavedBySummaries?: number;
}) => {
    // Get token limit for the model
    const { data: tokenLimit, error: tokenLimitError } =
        getRecommendedContextLimit({ model });

    if (tokenLimitError) {
        return Error('INVALID_MODEL');
    }

    // Calculate metadata for all messages (these are already filtered)
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

    // Convert summaries to message-like objects with metadata
    const summariesWithMetadata: SummaryWithMetadata[] = summaries.map(
        (summary) => {
            // Create a fake message for importance calculation
            const summaryAsMessage: ChatMessage = {
                id: summary.id,
                sessionId: summary.sessionId,
                content: summary.summary,
                role: 'assistant', // Treat summaries as assistant messages for scoring
                createdAt: summary.fromTimestamp, // Use start timestamp
                attachments: [],
            };

            const { data: importanceResult } = calculateMessageImportance({
                message: summaryAsMessage,
                allMessages: messages,
            });

            // Boost importance score for summaries since they contain condensed information
            const boostedImportanceScore = Math.min(
                importanceResult.score + 20,
                100,
            );

            return {
                ...summary,
                type: 'summary' as const,
                content: summary.summary,
                role: 'system' as const,
                createdAt: summary.fromTimestamp,
                id: summary.id,
                sessionId: summary.sessionId,
                attachments: [],
                tokenCount: summary.summaryTokenCount,
                importanceScore: boostedImportanceScore,
                importanceFactors: {
                    ...importanceResult.factors,
                    positionScore: 10, // Summaries are always important for position
                },
            };
        },
    );

    // Find the latest summary (most recent by creation time)
    const latestSummary =
        summariesWithMetadata.length > 0
            ? summariesWithMetadata.reduce((latest, current) =>
                  current.createdAt > latest.createdAt ? current : latest,
              )
            : null;

    // Calculate total tokens if we include all messages + summaries
    const totalTokens =
        messagesWithMetadata.reduce((sum, msg) => sum + msg.tokenCount, 0) +
        summariesWithMetadata.reduce(
            (sum, summary) => sum + summary.tokenCount,
            0,
        );

    // If all content fits within limits, return everything
    if (totalTokens <= tokenLimit) {
        const allItems: ContextItemWithMetadata[] = [
            ...summariesWithMetadata,
            ...messagesWithMetadata,
        ].sort((a, b) => a.createdAt - b.createdAt);

        if (latestSummary) {
            messagesWithMetadata.unshift({
                ...latestSummary,
                content: latestSummary.summary,
                role: 'assistant',
                createdAt: latestSummary.fromTimestamp,
                id: latestSummary.id,
                sessionId: latestSummary.sessionId,
                tokenCount: latestSummary.summaryTokenCount,
                importanceScore: 100,
            });
        }

        return Success({
            selectedItems: allItems,
            selectedMessages: messagesWithMetadata,
            selectedSummaries: summariesWithMetadata,
            totalTokens,
            totalMessages: messagesWithMetadata.length,
            totalSummaries: summariesWithMetadata.length,
            droppedMessages: 0, // No messages dropped since these are already optimized
            contextUtilization: (totalTokens / tokenLimit) * 100,
            averageImportanceScore: calculateAverageImportance(allItems),
            tokensSavedBySummaries,
            selectionStrategy: 'all' as const,
            optimizationUsed: true,
        });
    }

    // Try importance-based selection with optimized messages
    const importanceBasedResult = selectByImportanceOptimized({
        messages: messagesWithMetadata,
        summaries: summariesWithMetadata,
        latestSummary,
        tokenLimit,
        forceIncludeRecent,
        tokensSavedBySummaries,
    });

    if (importanceBasedResult.selectedItems.length > 0) {
        return Success({
            ...importanceBasedResult,
            selectionStrategy: 'importance-based-optimized' as const,
            optimizationUsed: true,
        });
    }

    // Fall back to sliding window with optimized messages
    const slidingWindowResult = selectBySlidingWindowOptimized({
        messages: messagesWithMetadata,
        summaries: summariesWithMetadata,
        latestSummary,
        tokenLimit,
        tokensSavedBySummaries,
    });

    if (slidingWindowResult.selectedItems.length > 0) {
        return Success({
            ...slidingWindowResult,
            selectionStrategy: 'sliding-window-optimized' as const,
            optimizationUsed: true,
        });
    }

    // Emergency: use only summaries if available, prioritizing the latest one
    if (summariesWithMetadata.length > 0) {
        const emergencySummaryResult = selectEmergencySummariesOptimized({
            summaries: summariesWithMetadata,
            latestSummary,
            tokenLimit,
            tokensSavedBySummaries,
        });

        if (emergencySummaryResult.selectedItems.length > 0) {
            return Success({
                ...emergencySummaryResult,
                selectedMessages: [],
                droppedMessages: messagesWithMetadata.length,
                selectionStrategy: 'summaries-only' as const,
                optimizationUsed: true,
            });
        }
    }

    // Final emergency: truncate most recent message
    return Success({
        ...emergencyTruncationOptimized({
            messages: messagesWithMetadata,
            summaries: summariesWithMetadata,
            latestSummary,
            tokenLimit,
            tokensSavedBySummaries,
        }),
        selectionStrategy: 'emergency-truncation' as const,
        optimizationUsed: true,
    });
}) satisfies Function<
    {
        messages: ChatMessage[];
        summaries: ConversationSummary[];
        model: AiModelName;
        forceIncludeRecent?: number;
        tokensSavedBySummaries?: number;
    },
    OptimizedContextSelectionResult
>;

/**
 * Select items by importance with optimized pre-filtered messages
 * Always prioritizes the latest summary
 */
function selectByImportanceOptimized({
    messages,
    summaries,
    latestSummary,
    tokenLimit,
    forceIncludeRecent,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    latestSummary: SummaryWithMetadata | null;
    tokenLimit: number;
    forceIncludeRecent: number;
    tokensSavedBySummaries: number;
}): Omit<
    OptimizedContextSelectionResult,
    'selectionStrategy' | 'optimizationUsed'
> {
    const selectedItems: ContextItemWithMetadata[] = [];
    let currentTokens = 0;

    // Always include the latest summary first if it exists and fits
    if (latestSummary && latestSummary.tokenCount <= tokenLimit) {
        selectedItems.push(latestSummary);
        currentTokens += latestSummary.tokenCount;
    }

    // Include other summaries (excluding the latest one we already added)
    const otherSummaries = summaries.filter((s) => s.id !== latestSummary?.id);
    for (const summary of otherSummaries) {
        if (currentTokens + summary.tokenCount <= tokenLimit) {
            selectedItems.push(summary);
            currentTokens += summary.tokenCount;
        }
    }

    // Sort messages by creation time (newest first)
    const sortedByTime = [...messages].sort(
        (a, b) => b.createdAt - a.createdAt,
    );

    // Force include the most recent messages
    const forcedMessages = sortedByTime.slice(0, forceIncludeRecent);
    const remainingMessages = sortedByTime.slice(forceIncludeRecent);

    // Add forced messages
    for (const message of forcedMessages) {
        if (currentTokens + message.tokenCount <= tokenLimit) {
            selectedItems.push(message);
            currentTokens += message.tokenCount;
        }
    }

    // Sort remaining messages by importance score (highest first)
    const sortedByImportance = remainingMessages.sort(
        (a, b) => b.importanceScore - a.importanceScore,
    );

    // Add messages by importance until we hit the token limit
    for (const message of sortedByImportance) {
        if (currentTokens + message.tokenCount <= tokenLimit) {
            selectedItems.push(message);
            currentTokens += message.tokenCount;
        }
    }

    // Sort selected items back to chronological order
    const finalItems = selectedItems.sort((a, b) => a.createdAt - b.createdAt);

    const selectedMessages = finalItems.filter(
        (item): item is MessageWithMetadata => !('type' in item),
    );

    const selectedSummaries = finalItems.filter(
        (item): item is SummaryWithMetadata => 'type' in item,
    );

    return {
        selectedItems: finalItems,
        selectedMessages,
        selectedSummaries,
        totalTokens: currentTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: selectedSummaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalItems),
        tokensSavedBySummaries,
    };
}

/**
 * Select items using sliding window with optimized messages
 * Always prioritizes the latest summary
 */
function selectBySlidingWindowOptimized({
    messages,
    summaries,
    latestSummary,
    tokenLimit,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    latestSummary: SummaryWithMetadata | null;
    tokenLimit: number;
    tokensSavedBySummaries: number;
}): Omit<
    OptimizedContextSelectionResult,
    'selectionStrategy' | 'optimizationUsed'
> {
    const selectedItems: ContextItemWithMetadata[] = [];
    let currentTokens = 0;

    // Always include the latest summary first if it exists and fits
    if (latestSummary && latestSummary.tokenCount <= tokenLimit) {
        selectedItems.push(latestSummary);
        currentTokens += latestSummary.tokenCount;
    }

    // Include other summaries (excluding the latest one we already added)
    const otherSummaries = summaries.filter((s) => s.id !== latestSummary?.id);
    for (const summary of otherSummaries) {
        if (currentTokens + summary.tokenCount <= tokenLimit) {
            selectedItems.push(summary);
            currentTokens += summary.tokenCount;
        } else {
            break;
        }
    }

    // Sort messages by creation time (newest first)
    const sortedMessages = [...messages].sort(
        (a, b) => b.createdAt - a.createdAt,
    );

    // Add messages from most recent until we hit the limit
    for (const message of sortedMessages) {
        if (currentTokens + message.tokenCount <= tokenLimit) {
            selectedItems.push(message);
            currentTokens += message.tokenCount;
        } else {
            break;
        }
    }

    // Sort selected items back to chronological order
    const finalItems = selectedItems.sort((a, b) => a.createdAt - b.createdAt);

    const selectedMessages = finalItems.filter(
        (item): item is MessageWithMetadata => !('type' in item),
    );

    const selectedSummaries = finalItems.filter(
        (item): item is SummaryWithMetadata => 'type' in item,
    );

    return {
        selectedItems: finalItems,
        selectedMessages,
        selectedSummaries,
        totalTokens: currentTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: selectedSummaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalItems),
        tokensSavedBySummaries,
    };
}

/**
 * Emergency summaries selection - prioritizes the latest summary
 */
function selectEmergencySummariesOptimized({
    summaries,
    latestSummary,
    tokenLimit,
    tokensSavedBySummaries,
}: {
    summaries: SummaryWithMetadata[];
    latestSummary: SummaryWithMetadata | null;
    tokenLimit: number;
    tokensSavedBySummaries: number;
}): Omit<
    OptimizedContextSelectionResult,
    | 'selectionStrategy'
    | 'optimizationUsed'
    | 'selectedMessages'
    | 'droppedMessages'
> {
    const selectedSummaries: SummaryWithMetadata[] = [];
    let currentTokens = 0;

    // Always try to include the latest summary first
    if (latestSummary && latestSummary.tokenCount <= tokenLimit) {
        selectedSummaries.push(latestSummary);
        currentTokens += latestSummary.tokenCount;
    }

    // Add other summaries if they fit
    const otherSummaries = summaries.filter((s) => s.id !== latestSummary?.id);
    for (const summary of otherSummaries) {
        if (currentTokens + summary.tokenCount <= tokenLimit) {
            selectedSummaries.push(summary);
            currentTokens += summary.tokenCount;
        }
    }

    const finalItems = selectedSummaries.sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    return {
        selectedItems: finalItems,
        selectedSummaries: finalItems,
        totalTokens: currentTokens,
        totalMessages: 0,
        totalSummaries: selectedSummaries.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalItems),
        tokensSavedBySummaries,
    };
}

/**
 * Emergency truncation with optimized messages
 * Always tries to include the latest summary
 */
function emergencyTruncationOptimized({
    messages,
    summaries,
    latestSummary,
    tokenLimit,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    latestSummary: SummaryWithMetadata | null;
    tokenLimit: number;
    tokensSavedBySummaries: number;
}): Omit<
    OptimizedContextSelectionResult,
    'selectionStrategy' | 'optimizationUsed'
> {
    const selectedItems: ContextItemWithMetadata[] = [];
    let currentTokens = 0;

    // Always try to include the latest summary first if it exists
    if (latestSummary && latestSummary.tokenCount <= tokenLimit * 0.7) {
        // Use max 70% for latest summary
        selectedItems.push(latestSummary);
        currentTokens += latestSummary.tokenCount;
    }

    // Try to include other summaries with remaining budget
    const otherSummaries = summaries.filter((s) => s.id !== latestSummary?.id);
    const summaryBudget = tokenLimit * 0.5 - currentTokens; // Use max 50% total for all summaries

    for (const summary of otherSummaries) {
        if (
            summary.tokenCount <= summaryBudget &&
            currentTokens + summary.tokenCount <= tokenLimit
        ) {
            selectedItems.push(summary);
            currentTokens += summary.tokenCount;
        }
    }

    const remainingTokens = tokenLimit - currentTokens;
    let selectedMessages: MessageWithMetadata[] = [];

    if (remainingTokens > 0 && messages.length > 0) {
        // Get the most recent message that fits
        const mostRecent = messages.reduce((latest, msg) =>
            msg.createdAt > latest.createdAt ? msg : latest,
        );

        if (mostRecent.tokenCount <= remainingTokens) {
            selectedMessages = [mostRecent];
            currentTokens += mostRecent.tokenCount;
        } else {
            // Truncate the most recent message
            const maxChars = remainingTokens * 4;
            const truncatedContent =
                mostRecent.content.substring(0, maxChars) + '...';
            const { data: truncatedTokens } = countTokens({
                text: truncatedContent,
            });

            const truncatedMessage = {
                ...mostRecent,
                content: truncatedContent,
                tokenCount: truncatedTokens,
            };

            selectedMessages = [truncatedMessage];
            currentTokens += truncatedTokens;
        }
    }

    const allItems: ContextItemWithMetadata[] = [
        ...selectedItems,
        ...selectedMessages,
    ].sort((a, b) => a.createdAt - b.createdAt);

    const selectedSummaries = selectedItems.filter(
        (item): item is SummaryWithMetadata => 'type' in item,
    );

    return {
        selectedItems: allItems,
        selectedMessages,
        selectedSummaries,
        totalTokens: currentTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: selectedSummaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(allItems),
        tokensSavedBySummaries,
    };
}

/**
 * Calculate average importance score for context items
 */
function calculateAverageImportance(items: ContextItemWithMetadata[]): number {
    if (items.length === 0) return 0;

    const totalScore = items.reduce(
        (sum, item) => sum + item.importanceScore,
        0,
    );
    return Math.round((totalScore / items.length) * 100) / 100;
}
