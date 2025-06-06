import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';
import { chatMessageTable } from '../db';
import { emit } from '@events/providers';

export type BatchUpdateConfig = {
    batchSize: number; // Number of characters to accumulate before update
    maxWaitTime: number; // Maximum time to wait before forcing an update (ms)
    messageId: string;
    sessionId: string;
};

export type StreamingUpdateState = {
    messageId: string;
    sessionId: string;
    pendingContent: string;
    lastUpdateTime: number;
    batchTimeout?: NodeJS.Timeout;
    isComplete: boolean;
};

/**
 * Manages batched database updates for streaming responses
 * Reduces database load by batching small updates together
 */
export class BatchUpdateManager {
    private activeUpdates = new Map<string, StreamingUpdateState>();
    private defaultConfig: Omit<BatchUpdateConfig, 'messageId' | 'sessionId'> =
        {
            batchSize: 50, // characters
            maxWaitTime: 200, // milliseconds
        };

    /**
     * Start a new streaming update session
     */
    startStream(config: BatchUpdateConfig): void {
        const state: StreamingUpdateState = {
            messageId: config.messageId,
            sessionId: config.sessionId,
            pendingContent: '',
            lastUpdateTime: Date.now(),
            isComplete: false,
        };

        this.activeUpdates.set(config.messageId, state);
    }

    /**
     * Add content to the streaming update
     */
    async addContent({
        messageId,
        content,
        customConfig,
    }: {
        messageId: string;
        content: string;
        customConfig?: Partial<BatchUpdateConfig>;
    }): Promise<{ data: boolean; error: string | null }> {
        const state = this.activeUpdates.get(messageId);
        if (!state) {
            return { data: false, error: 'STREAM_NOT_FOUND' };
        }

        if (state.isComplete) {
            return { data: false, error: 'STREAM_ALREADY_COMPLETE' };
        }

        // Add content to pending buffer
        state.pendingContent += content;

        const config = { ...this.defaultConfig, ...customConfig };

        // Check if we should flush the batch
        const shouldFlush =
            state.pendingContent.length >= config.batchSize ||
            Date.now() - state.lastUpdateTime >= config.maxWaitTime;

        if (shouldFlush) {
            const result = await this.flushUpdate(messageId);
            if (result.error) {
                return result;
            }
        } else {
            // Set or reset the timeout for automatic flushing
            this.setFlushTimeout(messageId, config.maxWaitTime);
        }

        return { data: true, error: null };
    }

    /**
     * Complete the streaming update and perform final flush
     */
    async completeStream(
        messageId: string,
    ): Promise<{ data: boolean; error: string | null }> {
        const state = this.activeUpdates.get(messageId);
        if (!state) {
            return { data: false, error: 'STREAM_NOT_FOUND' };
        }

        state.isComplete = true;

        // Clear any pending timeout
        if (state.batchTimeout) {
            clearTimeout(state.batchTimeout);
        }

        // Perform final flush if there's pending content
        if (state.pendingContent.length > 0) {
            const result = await this.flushUpdate(messageId);
            if (result.error) {
                return result;
            }
        }

        // Clean up the state
        this.activeUpdates.delete(messageId);

        return { data: true, error: null };
    }

    /**
     * Flush pending updates to database
     */
    private async flushUpdate(
        messageId: string,
    ): Promise<{ data: boolean; error: string | null }> {
        const state = this.activeUpdates.get(messageId);
        if (!state || state.pendingContent.length === 0) {
            return { data: true, error: null };
        }

        // Clear any pending timeout
        if (state.batchTimeout) {
            clearTimeout(state.batchTimeout);
            state.batchTimeout = undefined;
        }

        const { error } = await catchError(
            db.transaction(async (tx) => {
                // Get current message content
                const currentMessage =
                    await tx.query.chatMessageTable.findFirst({
                        where: eq(chatMessageTable.id, messageId),
                    });

                if (!currentMessage) {
                    throw 'MESSAGE_NOT_FOUND';
                }

                // Append pending content
                const newContent =
                    currentMessage.content + state.pendingContent;

                // Update message with new content
                await tx
                    .update(chatMessageTable)
                    .set({ content: newContent })
                    .where(eq(chatMessageTable.id, messageId));

                // Emit update event
                emit({
                    event: 'chatMessageUpdated',
                    payload: {
                        sessionId: state.sessionId,
                        id: messageId,
                        content: newContent,
                    },
                });

                // Reset pending content and update timestamp
                state.pendingContent = '';
                state.lastUpdateTime = Date.now();
            }),
        );

        if (error) {
            return { data: false, error: 'DATABASE_UPDATE_FAILED' };
        }

        return { data: true, error: null };
    }

    /**
     * Set timeout for automatic flushing
     */
    private setFlushTimeout(messageId: string, maxWaitTime: number): void {
        const state = this.activeUpdates.get(messageId);
        if (!state) return;

        // Clear existing timeout
        if (state.batchTimeout) {
            clearTimeout(state.batchTimeout);
        }

        // Set new timeout
        state.batchTimeout = setTimeout(() => {
            this.flushUpdate(messageId).catch(console.error);
        }, maxWaitTime);
    }

    /**
     * Get current state for a message (for debugging/monitoring)
     */
    getState(messageId: string): StreamingUpdateState | undefined {
        return this.activeUpdates.get(messageId);
    }

    /**
     * Get all active streams (for monitoring)
     */
    getActiveStreams(): string[] {
        return Array.from(this.activeUpdates.keys());
    }

    /**
     * Force flush all pending updates (for cleanup)
     */
    async flushAll(): Promise<void> {
        const promises = Array.from(this.activeUpdates.keys()).map(
            (messageId) => this.flushUpdate(messageId),
        );

        await Promise.allSettled(promises);
    }
}

// Singleton instance for use across the application
export const batchUpdateManager = new BatchUpdateManager();

/**
 * Convenience function for simple streaming updates
 */
export const streamMessageUpdate = (async ({
    messageId,
    sessionId,
    content,
    isComplete = false,
}: {
    messageId: string;
    sessionId: string;
    content: string;
    isComplete?: boolean;
}) => {
    // Start stream if not already started
    if (!batchUpdateManager.getState(messageId)) {
        batchUpdateManager.startStream({
            messageId,
            sessionId,
            batchSize: 50,
            maxWaitTime: 200,
        });
    }

    // Add content
    const { error: addError } = await batchUpdateManager.addContent({
        messageId,
        content,
    });

    if (addError) {
        return Error(addError);
    }

    // Complete stream if indicated
    if (isComplete) {
        const { error: completeError } =
            await batchUpdateManager.completeStream(messageId);

        if (completeError) {
            return Error(completeError);
        }
    }

    return Success(true);
}) satisfies Function<
    {
        messageId: string;
        sessionId: string;
        content: string;
        isComplete?: boolean;
    },
    boolean
>;
