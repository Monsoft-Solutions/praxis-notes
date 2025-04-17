import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { userTable } from './user.table';

// user unverified email
export const unverifiedEmailTable = table('unverified_email', {
    id: char('id', { length: 36 }).primaryKey(),

    userId: char('user_id', { length: 36 })
        .notNull()
        .unique()
        .references(() => userTable.id, { onDelete: 'cascade' }),

    email: varchar('email', { length: 255 }).unique().notNull(),

    password: varchar('password', { length: 255 }).notNull(),
});

export const unverifiedEmailTableRelations = relations(
    unverifiedEmailTable,

    ({ one }) => ({
        user: one(userTable, {
            fields: [unverifiedEmailTable.userId],
            references: [userTable.id],
        }),
    }),
);
