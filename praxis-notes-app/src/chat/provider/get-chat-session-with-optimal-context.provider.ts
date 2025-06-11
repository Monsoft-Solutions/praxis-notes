import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { eq, asc, gt, and, ne, isNotNull } from 'drizzle-orm';

import { chatSessionTable, chatMessageTable } from '../db';
import {
    getSessionSummaries,
    ConversationSummary,
} from '../utils/conversation-summarizer.util';

import { getFileById } from '@src/fs/providers/servers/get-file-by-id.provider';

import { ChatSession, ChatMessage } from '../schemas';
import { AiModelName } from '@src/ai/enums';

// File schema for typed attachments
import type { File } from '@shared/schemas';

// Add import for OptimizedContextSelectionResult
import { OptimizedContextSelectionResult } from '../schemas';
import { selectOptimalContextOptimized } from '../utils/smart-context-manager-optimized.util';

export type OptimalContextMetadata = {
    totalMessages: number;
    totalTokens: number;
    averageImportanceScore: number;
    contextUtilization: number;
    hasLongConversation: boolean;
    recommendsSummarization: boolean;
    tokenLimit: number;
    messagesAnalyzed: number;
    // New fields for summary optimization
    totalSummaries: number;
    latestSummaryTimestamp: number | null;
    messagesCoveredBySummaries: number;
    tokensSavedBySummaries: number;
    optimizationUsed: boolean;
};

export type ChatSessionWithOptimalContext = ChatSession & {
    summaries: ConversationSummary[];
    contextResult?: OptimizedContextSelectionResult;
};

/**
 * Get chat session with optimal context - only loads messages not covered by summaries
 * Plus all available summaries for efficient context management
 */
export const getChatSessionWithOptimalContext = (async ({
    sessionId,
    model = 'claude-3-5-haiku-latest',
    calculateMetadata = true,
    previewMode = false,
    maxPreviewMessages = 20,
    forceLoadAllMessages = false, // For backward compatibility
}: {
    sessionId: string;
    model?: AiModelName;
    calculateMetadata?: boolean;
    previewMode?: boolean;
    maxPreviewMessages?: number;
    forceLoadAllMessages?: boolean;
}) => {
    // Load session summaries first
    const { data: summaries, error: summariesError } =
        await getSessionSummaries({
            sessionId,
        });

    // If we can't load summaries or force loading all messages, fall back to old behavior
    if (summariesError || forceLoadAllMessages || summaries.length === 0) {
        return await getFallbackSession({
            sessionId,
            model,
            calculateMetadata,
            previewMode,
            maxPreviewMessages,
            summaries: summaries ?? [],
        });
    }

    // Find the latest summary timestamp to determine which messages to load
    const latestSummaryTimestamp = Math.max(
        ...summaries.map((s) => s.toTimestamp),
    );

    // Load only the session metadata first
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                // with: {
                //     messages: {
                //         where: and(
                //             isNotNull(chatMessageTable.content),
                //             ne(chatMessageTable.content, ''),
                //         ),
                //         orderBy: asc(chatMessageTable.createdAt),
                //         limit: previewMode ? maxPreviewMessages : undefined,
                //         with: {
                //             attachments: true,
                //         },
                //     },
                // },
            }),
        );

    if (rawChatSessionError) return Error();
    if (!rawChatSession) return Error();

    // Load only messages that come after the latest summary
    const { data: rawMessages, error: messagesError } = await catchError(
        db.query.chatMessageTable.findMany({
            where: and(
                gt(chatMessageTable.createdAt, latestSummaryTimestamp),
                isNotNull(chatMessageTable.content),
                ne(chatMessageTable.content, ''),
            ),
            orderBy: asc(chatMessageTable.createdAt),
            limit: previewMode ? maxPreviewMessages : undefined,
            with: {
                attachments: true,
            },
        }),
    );

    if (messagesError) return Error();

    // ------------------------------------------------------------
    // Batch-fetch attachments (drastically reduces DB round-trips)
    // ------------------------------------------------------------
    // 1️⃣ collect every unique fileId referenced in this slice of messages
    const uniqueFileIds = new Set<string>();
    rawMessages.forEach(({ attachments }) => {
        attachments.forEach(({ fileId }) => uniqueFileIds.add(fileId));
    });

    // 2️⃣ fetch each file concurrently *once*
    const fileResults = await Promise.all(
        Array.from(uniqueFileIds).map(async (fileId) => {
            const { data: file } = await getFileById({ id: fileId });
            return { fileId, file } as const;
        }),
    );

    // 3️⃣ create a fast lookup map <fileId, File>
    const fileMap = new Map<string, File>();
    fileResults.forEach(({ fileId, file }) => {
        if (file) fileMap.set(fileId, file);
    });

    // 4️⃣ hydrate messages with their full attachments in-memory (no extra I/O)
    const messages = rawMessages.map(
        ({ attachments: rawAttachments, ...message }) => ({
            ...message,
            attachments: rawAttachments
                .map(({ fileId }) => fileMap.get(fileId))
                .filter((item): item is File => item !== undefined),
        }),
    );

    const chatSession: ChatSessionWithOptimalContext = {
        ...rawChatSession,
        messages,
        summaries,
    };

    return Success(chatSession);
}) satisfies Function<
    {
        sessionId: string;
        model?: AiModelName;
        calculateMetadata?: boolean;
        previewMode?: boolean;
        maxPreviewMessages?: number;
        forceLoadAllMessages?: boolean;
    },
    ChatSessionWithOptimalContext
>;

/**
 * Enhanced version that combines session loading with optimal context selection
 * This eliminates the need for separate getChatSessionWithOptimalContext + selectOptimalContextOptimized calls
 */
export const getChatSessionWithContextSelected = (async ({
    sessionId,
    model = 'claude-3-5-haiku-latest',
    forceIncludeRecent = 3,
    allMessages = [],
    preloadedSession,
}: {
    sessionId: string;
    model?: AiModelName;
    forceIncludeRecent?: number;
    allMessages?: ChatMessage[]; // Pass existing messages if available to avoid extra DB calls
    preloadedSession?: ChatSessionWithOptimalContext; // NEW: accept an already-loaded session to skip I/O
}) => {
    // If a session is already provided, use it. Otherwise, load it from the DB.
    const chatSessionResult = preloadedSession
        ? Success(preloadedSession)
        : await getChatSessionWithOptimalContext({
              sessionId,
              model,
              calculateMetadata: true,
          });

    const { data: chatSession, error: chatSessionError } = chatSessionResult;

    if (chatSessionError) return Error();

    const { messages, summaries } = chatSession;

    // Use the messages passed in (which includes the new user message) or the loaded ones
    const messagesToProcess = allMessages.length > 0 ? allMessages : messages;

    const { data: contextResult, error: contextError } =
        selectOptimalContextOptimized({
            messages: messagesToProcess,
            summaries,
            model,
            forceIncludeRecent,
        });

    if (contextError) return Error();

    const enhancedChatSession: ChatSessionWithOptimalContext = {
        ...chatSession,
        messages: messagesToProcess,
        contextResult,
    };

    return Success(enhancedChatSession);
}) satisfies Function<
    {
        sessionId: string;
        model?: AiModelName;
        forceIncludeRecent?: number;
        allMessages?: ChatMessage[];
        preloadedSession?: ChatSessionWithOptimalContext;
    },
    ChatSessionWithOptimalContext
>;

/**
 * Fallback to old behavior when summaries aren't available
 */
async function getFallbackSession({
    sessionId,
    previewMode,
    maxPreviewMessages,
    summaries,
}: {
    sessionId: string;
    model: AiModelName;
    calculateMetadata: boolean;
    previewMode: boolean;
    maxPreviewMessages: number;
    summaries: ConversationSummary[];
}) {
    const { data: rawChatSession, error: rawChatSessionError } =
        await catchError(
            db.query.chatSessionTable.findFirst({
                where: eq(chatSessionTable.id, sessionId),
                with: {
                    messages: {
                        where: and(
                            isNotNull(chatMessageTable.content),
                            ne(chatMessageTable.content, ''),
                        ),
                        orderBy: asc(chatMessageTable.createdAt),
                        limit: previewMode ? maxPreviewMessages : undefined,
                        with: {
                            attachments: true,
                        },
                    },
                },
            }),
        );

    if (rawChatSessionError) return Error();
    if (!rawChatSession) return Error();

    const { messages: rawMessages } = rawChatSession;

    // ------------------------------------------------------------
    // Batch-fetch attachments for fallback mode
    // ------------------------------------------------------------
    const uniqueFallbackFileIds = new Set<string>();
    rawMessages.forEach(({ attachments }) => {
        attachments.forEach(({ fileId }) => uniqueFallbackFileIds.add(fileId));
    });

    const fallbackFileResults = await Promise.all(
        Array.from(uniqueFallbackFileIds).map(async (fileId) => {
            const { data: file } = await getFileById({ id: fileId });
            return { fileId, file } as const;
        }),
    );

    const fallbackFileMap = new Map<string, File>();
    fallbackFileResults.forEach(({ fileId, file }) => {
        if (file) fallbackFileMap.set(fileId, file);
    });

    const messages = rawMessages.map(
        ({ attachments: rawAttachments, ...message }) => ({
            ...message,
            attachments: rawAttachments
                .map(({ fileId }) => fallbackFileMap.get(fileId))
                .filter((item): item is File => item !== undefined),
        }),
    );

    const chatSession: ChatSessionWithOptimalContext = {
        ...rawChatSession,
        messages,
        summaries,
    };

    return Success(chatSession);
}
