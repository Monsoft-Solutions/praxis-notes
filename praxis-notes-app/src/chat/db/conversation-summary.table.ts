import { relations } from 'drizzle-orm';

// import from the db base, not from drizzle
import { char, table, text, bigint, int } from '@db/sql';

import { chatSessionTable } from './chat-session.table';

// conversation summaries for long chat sessions
export const conversationSummaryTable = table('conversation_summary', {
    id: char('id', { length: 36 }).primaryKey(),

    // chat session this summary belongs to
    sessionId: char('session_id', { length: 36 })
        .notNull()
        .references(() => chatSessionTable.id),

    // summary content of the conversation chunk
    summary: text('summary').notNull(),

    // timestamp range this summary covers
    fromTimestamp: bigint('from_timestamp', {
        mode: 'number',
    }).notNull(),

    toTimestamp: bigint('to_timestamp', {
        mode: 'number',
    }).notNull(),

    // original token count before summarization
    originalTokenCount: int('original_token_count').notNull(),

    // token count of the summary
    summaryTokenCount: int('summary_token_count').notNull(),

    // creation timestamp
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    // last update timestamp
    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),
});

export const conversationSummaryTableRelations = relations(
    conversationSummaryTable,
    ({ one }) => ({
        // session this summary belongs to
        session: one(chatSessionTable, {
            fields: [conversationSummaryTable.sessionId],
            references: [chatSessionTable.id],
        }),
    }),
);
