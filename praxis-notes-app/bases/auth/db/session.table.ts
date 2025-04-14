import { relations } from 'drizzle-orm';
import { bigint, char, table } from '@db/sql';

import { userTable } from './user.table';

// Session table
// active user sessions
export const sessionTable = table('sessions', {
    id: char('id', { length: 36 }).primaryKey(),

    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id, { onDelete: 'cascade' }),

    expiresAt: bigint('expires_at', {
        mode: 'number',
    }).notNull(),
});

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));
