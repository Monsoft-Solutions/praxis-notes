import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';
import { countTokens, getRecommendedContextLimit } from './token-counter.util';
import {
    calculateMessageImportance,
    MessageImportanceResult,
} from './message-importance-scorer.util';
import {
    getSessionSummaries,
    ConversationSummary,
} from './conversation-summarizer.util';
import { logger } from '@logger/providers';

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

export type EnhancedContextSelectionResult = {
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
        | 'importance-based-with-summaries'
        | 'sliding-window-with-summaries'
        | 'summaries-only'
        | 'emergency-truncation';
};

/**
 * Select optimal context including summaries for AI responses
 */
export const selectOptimalContextWithSummaries = (async ({
    messages,
    sessionId,
    model,
    forceIncludeRecent = 3,
    includeSummaries = true,
}: {
    messages: ChatMessage[];
    sessionId: string;
    model: AiModelName;
    forceIncludeRecent?: number;
    includeSummaries?: boolean;
}) => {
    // Get token limit for the model
    const { data: tokenLimit, error: tokenLimitError } =
        getRecommendedContextLimit({ model });

    if (tokenLimitError) {
        return Error('INVALID_MODEL');
    }

    // Load conversation summaries if enabled
    let summaries: ConversationSummary[] = [];
    if (includeSummaries) {
        const { data: sessionSummaries, error: summariesError } =
            await getSessionSummaries({
                sessionId,
            });

        if (summariesError) {
            logger.warn('Failed to load summaries, proceeding without them', {
                sessionId,
                error: summariesError,
            });
        } else {
            summaries = sessionSummaries;
        }
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

    // Filter messages that are already covered by summaries
    const uncoveredMessages = getUncoveredMessages(
        messagesWithMetadata,
        summaries,
    );

    // Calculate total tokens if we include all uncovered messages + summaries
    const totalTokens =
        uncoveredMessages.reduce((sum, msg) => sum + msg.tokenCount, 0) +
        summariesWithMetadata.reduce(
            (sum, summary) => sum + summary.tokenCount,
            0,
        );

    // Calculate tokens saved by using summaries
    const tokensSavedBySummaries = summaries.reduce(
        (sum, summary) =>
            sum + (summary.originalTokenCount - summary.summaryTokenCount),
        0,
    );

    // If all content fits within limits, return everything
    if (totalTokens <= tokenLimit) {
        const allItems: ContextItemWithMetadata[] = [
            ...summariesWithMetadata,
            ...uncoveredMessages,
        ].sort((a, b) => a.createdAt - b.createdAt);

        return Success({
            selectedItems: allItems,
            selectedMessages: uncoveredMessages,
            selectedSummaries: summariesWithMetadata,
            totalTokens,
            totalMessages: uncoveredMessages.length,
            totalSummaries: summariesWithMetadata.length,
            droppedMessages:
                messagesWithMetadata.length - uncoveredMessages.length,
            contextUtilization: (totalTokens / tokenLimit) * 100,
            averageImportanceScore: calculateAverageImportance(allItems),
            tokensSavedBySummaries,
            selectionStrategy: 'all' as const,
        });
    }

    // Try importance-based selection with summaries
    const importanceBasedResult = selectByImportanceWithSummaries({
        messages: uncoveredMessages,
        summaries: summariesWithMetadata,
        tokenLimit,
        forceIncludeRecent,
        tokensSavedBySummaries,
    });

    if (importanceBasedResult.selectedItems.length > 0) {
        return Success({
            ...importanceBasedResult,
            selectionStrategy: 'importance-based-with-summaries' as const,
        });
    }

    // Fall back to sliding window with summaries
    const slidingWindowResult = selectBySlidingWindowWithSummaries({
        messages: uncoveredMessages,
        summaries: summariesWithMetadata,
        tokenLimit,
        tokensSavedBySummaries,
    });

    if (slidingWindowResult.selectedItems.length > 0) {
        return Success({
            ...slidingWindowResult,
            selectionStrategy: 'sliding-window-with-summaries' as const,
        });
    }

    // Emergency: use only summaries if available
    if (summariesWithMetadata.length > 0) {
        const summaryTokens = summariesWithMetadata.reduce(
            (sum, summary) => sum + summary.tokenCount,
            0,
        );

        if (summaryTokens <= tokenLimit) {
            return Success({
                selectedItems: summariesWithMetadata,
                selectedMessages: [],
                selectedSummaries: summariesWithMetadata,
                totalTokens: summaryTokens,
                totalMessages: 0,
                totalSummaries: summariesWithMetadata.length,
                droppedMessages: messagesWithMetadata.length,
                contextUtilization: (summaryTokens / tokenLimit) * 100,
                averageImportanceScore: calculateAverageImportance(
                    summariesWithMetadata,
                ),
                tokensSavedBySummaries,
                selectionStrategy: 'summaries-only' as const,
            });
        }
    }

    // Final emergency: truncate most recent message
    return Success({
        ...emergencyTruncationWithSummaries({
            messages: uncoveredMessages,
            summaries: summariesWithMetadata,
            tokenLimit,
            tokensSavedBySummaries,
        }),
        selectionStrategy: 'emergency-truncation' as const,
    });
}) satisfies Function<
    {
        messages: ChatMessage[];
        sessionId: string;
        model: AiModelName;
        forceIncludeRecent?: number;
        includeSummaries?: boolean;
    },
    EnhancedContextSelectionResult
>;

/**
 * Filter out messages that are already covered by summaries
 */
function getUncoveredMessages(
    messages: MessageWithMetadata[],
    summaries: ConversationSummary[],
): MessageWithMetadata[] {
    if (summaries.length === 0) return messages;

    return messages.filter((message) => {
        // Check if this message is covered by any summary
        return !summaries.some(
            (summary) =>
                message.createdAt >= summary.fromTimestamp &&
                message.createdAt <= summary.toTimestamp,
        );
    });
}

/**
 * Select items by importance, including summaries
 */
function selectByImportanceWithSummaries({
    messages,
    summaries,
    tokenLimit,
    forceIncludeRecent,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    tokenLimit: number;
    forceIncludeRecent: number;
    tokensSavedBySummaries: number;
}): Omit<EnhancedContextSelectionResult, 'selectionStrategy'> {
    // Always include all summaries (they're highly compressed)
    const selectedItems: ContextItemWithMetadata[] = [...summaries];
    let currentTokens = summaries.reduce((sum, s) => sum + s.tokenCount, 0);

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

    return {
        selectedItems: finalItems,
        selectedMessages,
        selectedSummaries: summaries,
        totalTokens: currentTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: summaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalItems),
        tokensSavedBySummaries,
    };
}

/**
 * Select items using sliding window with summaries
 */
function selectBySlidingWindowWithSummaries({
    messages,
    summaries,
    tokenLimit,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    tokenLimit: number;
    tokensSavedBySummaries: number;
}): Omit<EnhancedContextSelectionResult, 'selectionStrategy'> {
    // Start with summaries
    const selectedItems: ContextItemWithMetadata[] = [...summaries];
    let currentTokens = summaries.reduce((sum, s) => sum + s.tokenCount, 0);

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

    return {
        selectedItems: finalItems,
        selectedMessages,
        selectedSummaries: summaries,
        totalTokens: currentTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: summaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (currentTokens / tokenLimit) * 100,
        averageImportanceScore: calculateAverageImportance(finalItems),
        tokensSavedBySummaries,
    };
}

/**
 * Emergency truncation with summaries
 */
function emergencyTruncationWithSummaries({
    messages,
    summaries,
    tokenLimit,
    tokensSavedBySummaries,
}: {
    messages: MessageWithMetadata[];
    summaries: SummaryWithMetadata[];
    tokenLimit: number;
    tokensSavedBySummaries: number;
}): Omit<EnhancedContextSelectionResult, 'selectionStrategy'> {
    // Try to include at least some summaries
    const selectedSummaries = summaries.filter((summary) => {
        return summary.tokenCount <= tokenLimit / 2; // Use max 50% for summaries
    });

    const summaryTokens = selectedSummaries.reduce(
        (sum, s) => sum + s.tokenCount,
        0,
    );
    const remainingTokens = tokenLimit - summaryTokens;

    let selectedMessages: MessageWithMetadata[] = [];

    if (remainingTokens > 0 && messages.length > 0) {
        // Get the most recent message that fits
        const mostRecent = messages.reduce((latest, msg) =>
            msg.createdAt > latest.createdAt ? msg : latest,
        );

        if (mostRecent.tokenCount <= remainingTokens) {
            selectedMessages = [mostRecent];
        } else {
            // Truncate the most recent message
            const maxChars = remainingTokens * 4;
            const truncatedContent =
                mostRecent.content.substring(0, maxChars) + '...';
            const { data: truncatedTokens } = countTokens({
                text: truncatedContent,
            });

            selectedMessages = [
                {
                    ...mostRecent,
                    content: truncatedContent,
                    tokenCount: truncatedTokens,
                },
            ];
        }
    }

    const allItems: ContextItemWithMetadata[] = [
        ...selectedSummaries,
        ...selectedMessages,
    ].sort((a, b) => a.createdAt - b.createdAt);

    const totalTokens =
        summaryTokens +
        selectedMessages.reduce((sum, m) => sum + m.tokenCount, 0);

    return {
        selectedItems: allItems,
        selectedMessages,
        selectedSummaries,
        totalTokens,
        totalMessages: selectedMessages.length,
        totalSummaries: selectedSummaries.length,
        droppedMessages: messages.length - selectedMessages.length,
        contextUtilization: (totalTokens / tokenLimit) * 100,
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
