import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { clientSessionTable } from '@db/db.tables';

/**
 * client sessions
 */
export const clientSessionParticipantTable = table(
    'client_session_participant',
    {
        id: char('id', { length: 36 }).primaryKey(),

        // client session
        clientSessionId: char('client_session_id', { length: 36 })
            .references(() => clientSessionTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        // name of the participant
        name: varchar('name', { length: 255 }).notNull(),
    },
);

export const clientSessionParticipantTableRelations = relations(
    clientSessionParticipantTable,

    ({ one }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionParticipantTable.clientSessionId],
            references: [clientSessionTable.id],
        }),
    }),
);
