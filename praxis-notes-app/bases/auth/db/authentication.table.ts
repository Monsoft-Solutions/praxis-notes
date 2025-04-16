import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { userTable } from './user.table';

// Authentication table
// user authentication credentials
export const authenticationTable = table('authentications', {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 })
        .notNull()
        .unique()
        .references(() => userTable.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
});

export const authenticationTableRelations = relations(
    authenticationTable,

    ({ one }) => ({
        user: one(userTable, {
            fields: [authenticationTable.userId],
            references: [userTable.id],
        }),
    }),
);
