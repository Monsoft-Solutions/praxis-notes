import { relations } from 'drizzle-orm';

import { char, table, varchar, bigint } from '@db/sql';

import { userTable } from '../../../bases/db/db.tables';
import { chatMessageTable } from './chat-message.table';
// chat sessions
export const chatSessionTable = table('chat_session', {
    id: char('id', { length: 36 }).primaryKey(),

    // user who owns the chat session
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // title of the chat session
    title: varchar('title', { length: 255 }).notNull(),

    // creation timestamp
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    // last update timestamp
    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),
});

export const chatSessionTableRelations = relations(
    chatSessionTable,

    ({ one, many }) => ({
        // owner of the chat session
        user: one(userTable, {
            fields: [chatSessionTable.userId],
            references: [userTable.id],
        }),

        // messages in the chat session
        messages: many(chatMessageTable),
    }),
);
