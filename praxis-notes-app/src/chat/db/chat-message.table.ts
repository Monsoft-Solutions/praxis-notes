import { relations } from 'drizzle-orm';

import { char, table, bigint, text, sqlEnum, enumType, int } from '@db/sql';

import { chatSessionTable } from './chat-session.table';
import { chatMessageAttachmentTable } from './chat-message-attachment.table';

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

    // approximate token count for context management
    tokenCount: int('token_count'),

    // importance score (0-100) for context selection
    importanceScore: int('importance_score'),
});

export const chatMessageTableRelations = relations(
    chatMessageTable,

    ({ one, many }) => ({
        // session this message belongs to
        session: one(chatSessionTable, {
            fields: [chatMessageTable.sessionId],
            references: [chatSessionTable.id],
        }),

        // attachments of the message
        attachments: many(chatMessageAttachmentTable),
    }),
);
