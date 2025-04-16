import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { clientSessionTable } from '@db/db.tables';

/**
 * client sessions
 */
export const clientSessionEnvironmentalChangeTable = table(
    'client_session_environmental_change',
    {
        id: char('id', { length: 36 }).primaryKey(),

        // client session
        clientSessionId: char('client_session_id', { length: 36 })
            .references(() => clientSessionTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        // name of the environmental change
        name: varchar('name', { length: 255 }).notNull(),
    },
);

export const clientSessionEnvironmentalChangeTableRelations = relations(
    clientSessionEnvironmentalChangeTable,

    ({ one }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionEnvironmentalChangeTable.clientSessionId],
            references: [clientSessionTable.id],
        }),
    }),
);
