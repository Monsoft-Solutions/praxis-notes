import { relations } from 'drizzle-orm';

import { table, char, int } from '@db/sql';

import { user } from '@db/db.tables';
import { clientTable } from './client.table';

/**
 * many-to-many relationship between users and clients
 */
export const userClientTable = table('user_client', {
    userId: char('user_id', { length: 36 })
        .references(() => user.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    clientId: char('client_id', { length: 36 })
        .references(() => clientTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    createdAt: int('created_at').notNull(),

    updatedAt: int('updated_at').notNull(),
});

export const userClientTableRelations = relations(
    userClientTable,
    ({ one }) => ({
        user: one(user, {
            fields: [userClientTable.userId],
            references: [user.id],
        }),

        client: one(clientTable, {
            fields: [userClientTable.clientId],
            references: [clientTable.id],
        }),
    }),
);
