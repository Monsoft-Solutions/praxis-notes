import { relations } from 'drizzle-orm';

// import from the db base, not from drizzle
import { char, table, varchar, text, bigint, enumType, sqlEnum } from '@db/sql';

import { userTable } from '../../../bases/db/db.tables';

import { supportStatusEnum } from '../enums/support-status.enum';

// support status as an SQL enum
export const supportStatusEnumSql = enumType(
    'support_status',
    supportStatusEnum.options,
);

// support messages from users
export const supportMessageTable = table('support_message', {
    id: char('id', { length: 36 }).primaryKey(),

    // user who sent the message (can be null for anonymous messages)
    userId: char('user_id', { length: 36 }).references(() => userTable.id),

    // name provided by the user
    name: varchar('name', { length: 255 }),

    // phone number for contact
    phone: varchar('phone', { length: 50 }).notNull(),

    // message content
    message: text('message').notNull(),

    // timestamp when the message was sent
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    // status of the support request (pending, in-progress, resolved)
    status: sqlEnum('status', supportStatusEnumSql)
        .notNull()
        .default('pending'),
});

export const supportMessageTableRelations = relations(
    supportMessageTable,
    ({ one }) => ({
        // user who sent the message
        user: one(userTable, {
            fields: [supportMessageTable.userId],
            references: [userTable.id],
        }),
    }),
);
