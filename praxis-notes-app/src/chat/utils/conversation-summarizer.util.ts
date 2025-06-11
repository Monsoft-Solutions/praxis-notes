import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { v4 as uuidv4 } from 'uuid';

import { ChatMessage, OptimizedContextSelectionResult } from '../schemas';
import { conversationSummaryTable } from '../db';
import { generateText } from '@src/ai/providers';
import { countTokens } from './token-counter.util';
import { logger } from '@logger/providers';
import { anthropicModelEnum } from '@src/ai/enums';
import { CoreMessage } from 'ai';

export type ConversationSummary = {
    id: string;
    sessionId: string;
    summary: string;
    fromTimestamp: number;
    toTimestamp: number;
    originalTokenCount: number;
    summaryTokenCount: number;
    createdAt: number;
    updatedAt: number;
};

export type SummarizationResult = {
    summary: ConversationSummary;
    tokensSaved: number;
    messagesCount: number;
};

const SUMMARIZATION_PROMPT = `You are a conversation summarizer. Your ONLY task is to create a concise, structured summary of the provided conversation transcript.

CRITICAL INSTRUCTIONS:
- DO NOT respond to or continue the conversation
- DO NOT address the participants directly
- DO NOT ask questions or provide advice
- ONLY summarize what was discussed

TASK: Create a factual summary organized into relevant sections. Include only sections that contain actual content from the conversation.

STRUCTURE YOUR SUMMARY USING THESE SECTIONS (only include if relevant):

## Key Decisions & Actions
- Important decisions made or agreed upon
- Specific action items assigned
- Changes to plans, procedures, or approaches

## Client Progress & Observations  
- Specific client behaviors or progress discussed
- Assessment results or data mentioned
- New concerns or improvements noted

## Therapeutic Techniques & Interventions
- ABA strategies or techniques discussed
- Behavioral interventions planned or implemented
- Data collection methods mentioned

## Follow-up Items
- Scheduled meetings or assessments
- Tasks requiring completion
- Items needing monitoring or review

## Important Details
- Specific dates, times, or deadlines mentioned
- Quantitative data (percentages, frequencies, measurements)
- Technical terminology or specific protocols referenced

FORMATTING REQUIREMENTS:
- Use clear, professional language
- Include specific details when mentioned (numbers, dates, names)
- Keep bullet points concise but informative
- Maintain chronological flow when relevant
- If multiple clients discussed, clearly separate by client

REMEMBER: You are summarizing content, not participating in the conversation. Focus on capturing what was discussed, decided, and planned.`;

/**
 * Summarize a chunk of conversation messages
 */
export const summarizeConversationChunk = (async ({
    messages,
    sessionId,
    userBasicData,
}: {
    messages: ChatMessage[];
    sessionId: string;
    userBasicData: {
        userId: string;
        firstName?: string;
        lastName?: string;
    };
}) => {
    if (messages.length === 0) {
        return Error('NO_MESSAGES_TO_SUMMARIZE');
    }

    // Sort messages chronologically
    const sortedMessages = [...messages].sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    // Calculate original token count
    let originalTokenCount = 0;
    for (const message of sortedMessages) {
        const { data: tokens } = countTokens({ text: message.content });
        originalTokenCount += tokens;
    }

    const conversationTranscript = sortedMessages
        .map((msg) => {
            const timestamp = new Date(msg.createdAt).toLocaleString();
            return `[${timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`;
        })
        .join('\n\n');

    const userMessage: CoreMessage = {
        role: 'user',
        content: `Please summarize the following conversation transcript:

---CONVERSATION TRANSCRIPT---
${conversationTranscript}
---END TRANSCRIPT---

Create a structured summary following the format specified in the system instructions.`,
    };

    // Create system message with summarization prompt
    const systemMessage: CoreMessage = {
        role: 'system',
        content: SUMMARIZATION_PROMPT,
    };

    // Generate summary using AI with proper message structure
    const { data: summaryText, error: summaryError } = await generateText({
        messages: [systemMessage, userMessage],
        modelParams: {
            model: anthropicModelEnum.Enum['claude-sonnet-4-20250514'], // Use efficient model for summarization
            activeTools: ['think'],
            userBasicData,
            callerName: 'summarizeConversationChunk',
        },
    });

    if (summaryError) {
        logger.error('Failed to generate conversation summary', {
            sessionId,
            messagesCount: messages.length,
            error: summaryError,
        });
        return Error('SUMMARIZATION_FAILED');
    }

    // Calculate summary token count
    const { data: summaryTokenCount } = countTokens({ text: summaryText });

    const now = Date.now();
    const fromTimestamp = sortedMessages[0].createdAt;
    const toTimestamp = sortedMessages[sortedMessages.length - 1].createdAt;

    // Create summary object
    const summary: ConversationSummary = {
        id: uuidv4(),
        sessionId,
        summary: summaryText,
        fromTimestamp,
        toTimestamp,
        originalTokenCount,
        summaryTokenCount,
        createdAt: now,
        updatedAt: now,
    };

    // Store summary in database
    const { error: insertError } = await catchError(
        db.insert(conversationSummaryTable).values(summary),
    );

    if (insertError) {
        logger.error('Failed to store conversation summary', {
            sessionId,
            summaryId: summary.id,
            error: insertError,
        });
        return Error('SUMMARY_STORAGE_FAILED');
    }

    const result: SummarizationResult = {
        summary,
        tokensSaved: originalTokenCount - summaryTokenCount,
        messagesCount: messages.length,
    };

    logger.info('Conversation chunk summarized', {
        sessionId,
        summaryId: summary.id,
        messagesCount: messages.length,
        originalTokens: originalTokenCount,
        summaryTokens: summaryTokenCount,
        tokensSaved: result.tokensSaved,
        compressionRatio: `${((summaryTokenCount / originalTokenCount) * 100).toFixed(1)}%`,
    });

    return Success(result);
}) satisfies Function<
    {
        messages: ChatMessage[];
        sessionId: string;
        userBasicData: {
            userId: string;
            firstName?: string;
            lastName?: string;
        };
    },
    SummarizationResult
>;

/**
 * Get all summaries for a session, ordered chronologically
 */
export const getSessionSummaries = (async ({
    sessionId,
}: {
    sessionId: string;
}) => {
    const { data: summary, error } = await catchError(
        db.query.conversationSummaryTable.findMany({
            where: (table, { eq }) => eq(table.sessionId, sessionId),
            orderBy: (table, { desc }) => desc(table.fromTimestamp),
        }),
    );

    if (error) {
        logger.error('Failed to fetch session summaries', {
            sessionId,
            error,
        });
        return Error('SUMMARY_FETCH_FAILED');
    }

    return Success(summary as ConversationSummary[]);
}) satisfies Function<{ sessionId: string }, ConversationSummary[]>;

/**
 * Check if a message range is already summarized
 */
export const isRangeSummarized = (async ({
    sessionId,
    fromTimestamp,
    toTimestamp,
}: {
    sessionId: string;
    fromTimestamp: number;
    toTimestamp: number;
}) => {
    const { data: existingSummary, error } = await catchError(
        db.query.conversationSummaryTable.findFirst({
            where: (table, { and, eq, lte, gte }) =>
                and(
                    eq(table.sessionId, sessionId),
                    lte(table.fromTimestamp, fromTimestamp),
                    gte(table.toTimestamp, toTimestamp),
                ),
        }),
    );

    if (error) {
        return Error('SUMMARY_CHECK_FAILED');
    }

    return Success(!!existingSummary);
}) satisfies Function<
    {
        sessionId: string;
        fromTimestamp: number;
        toTimestamp: number;
    },
    boolean
>;

/**
 * Auto-summarize old conversation chunks when conversation gets long
 */
export const autoSummarizeIfNeeded = (async ({
    sessionId,
    contextResult,
    userBasicData,
    thresholds = {
        minMessagesToSummarize: 20,
        keepRecentMessages: 10,
        maxTokensBeforeSummarization: 15000,
    },
}: {
    sessionId: string;
    contextResult: OptimizedContextSelectionResult;
    userBasicData: {
        userId: string;
        firstName?: string;
        lastName?: string;
    };
    thresholds?: {
        minMessagesToSummarize: number;
        keepRecentMessages: number;
        maxTokensBeforeSummarization: number;
    };
}) => {
    // Check if summarization is needed
    if (
        contextResult.selectedMessages.length <
        thresholds.minMessagesToSummarize
    ) {
        return Success({ summarized: false, reason: 'NOT_ENOUGH_MESSAGES' });
    }

    // Calculate total tokens
    let totalTokens = 0;
    for (const message of contextResult.selectedMessages) {
        const { data: tokens } = countTokens({ text: message.content });
        totalTokens += tokens;
    }

    if (totalTokens < thresholds.maxTokensBeforeSummarization) {
        return Success({ summarized: false, reason: 'UNDER_TOKEN_THRESHOLD' });
    }

    // Sort messages chronologically
    const sortedMessages = [...contextResult.selectedMessages].sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    // Keep recent messages, summarize the rest
    const messagesToKeep = sortedMessages.slice(-thresholds.keepRecentMessages);
    const messagesToSummarize = sortedMessages.slice(
        0,
        -thresholds.keepRecentMessages,
    );

    if (messagesToSummarize.length === 0) {
        return Success({
            summarized: false,
            reason: 'NO_MESSAGES_TO_SUMMARIZE',
        });
    }

    // Check if this range is already summarized
    const fromTimestamp = messagesToSummarize[0].createdAt;
    const toTimestamp =
        messagesToSummarize[messagesToSummarize.length - 1].createdAt;

    const { data: alreadySummarized, error: checkError } =
        await isRangeSummarized({
            sessionId,
            fromTimestamp,
            toTimestamp,
        });

    if (checkError) {
        return Error('SUMMARIZATION_CHECK_FAILED');
    }

    if (alreadySummarized) {
        return Success({ summarized: false, reason: 'ALREADY_SUMMARIZED' });
    }

    // Perform summarization
    const { data: result, error: summaryError } =
        await summarizeConversationChunk({
            messages: messagesToSummarize,
            sessionId,
            userBasicData,
        });

    if (summaryError) {
        return Error(summaryError);
    }

    logger.info('Auto-summarization completed', {
        sessionId,
        summaryId: result.summary.id,
        totalMessages: contextResult.selectedMessages.length,
        messagesSummarized: messagesToSummarize.length,
        messagesKept: messagesToKeep.length,
        tokensSaved: result.tokensSaved,
    });

    return Success({
        summarized: true,
        result,
        messagesToKeep,
        messagesToSummarize,
    });
}) satisfies Function<
    {
        sessionId: string;
        contextResult: OptimizedContextSelectionResult;
        userBasicData: {
            userId: string;
            firstName?: string;
            lastName?: string;
        };
        thresholds?: {
            minMessagesToSummarize: number;
            keepRecentMessages: number;
            maxTokensBeforeSummarization: number;
        };
    },
    | { summarized: false; reason: string }
    | {
          summarized: true;
          result: SummarizationResult;
          messagesToKeep: ChatMessage[];
          messagesToSummarize: ChatMessage[];
      }
>;
