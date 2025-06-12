import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { chatMessageTable } from './chat-message.table';
import { fileTable } from '@src/fs/db';

// chat messages attachments
export const chatMessageAttachmentTable = table('chat_message_attachment', {
    id: char('id', { length: 36 }).primaryKey(),

    // chat message this attachment belongs to
    messageId: char('message_id', { length: 36 })
        .notNull()
        .references(() => chatMessageTable.id),

    // file storing the attachment
    fileId: char('file_id', { length: 36 })
        .notNull()
        .references(() => fileTable.id),
});

export const chatMessageAttachmentTableRelations = relations(
    chatMessageAttachmentTable,

    ({ one }) => ({
        // message this attachment belongs to
        message: one(chatMessageTable, {
            fields: [chatMessageAttachmentTable.messageId],
            references: [chatMessageTable.id],
        }),

        // file storing the attachment
        file: one(fileTable, {
            fields: [chatMessageAttachmentTable.fileId],
            references: [fileTable.id],
        }),
    }),
);
