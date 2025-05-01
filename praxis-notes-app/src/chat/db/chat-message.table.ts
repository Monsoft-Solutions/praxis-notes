import { relations } from 'drizzle-orm';

import { char, table, bigint, text, sqlEnum, enumType } from '@db/sql';

import { chatSessionTable } from './chat-session.table';

import { chatMessageAuthorEnum } from '../enums';

export const ChatMessageRole = enumType(
    'chat_message_role',
    chatMessageAuthorEnum.options,
);

// chat messages
export const chatMessageTable = table('chat_message', {
    id: char('id', { length: 36 }).primaryKey(),

    // chat session this message belongs to
    sessionId: char('session_id', { length: 36 })
        .notNull()
        .references(() => chatSessionTable.id),

    // role of the sender (user or assistant)
    role: sqlEnum('role', ChatMessageRole).notNull(),

    // content of the message
    content: text('content').notNull(),

    // creation timestamp
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),
});

export const chatMessageTableRelations = relations(
    chatMessageTable,

    ({ one }) => ({
        // session this message belongs to
        session: one(chatSessionTable, {
            fields: [chatMessageTable.sessionId],
            references: [chatSessionTable.id],
        }),
    }),
);
