import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionTable } from '@src/client-session/db/client-session.table';

import { reinforcerTable } from '@db/db.tables';
import { primaryKey } from 'drizzle-orm/pg-core';

/**
 * client session abc entry
 */
export const clientSessionReinforcerTable = table(
    'client_session_reinforcer',
    {
        clientSessionId: char('client_session_id', { length: 36 }).references(
            () => clientSessionTable.id,
            { onDelete: 'cascade' },
        ),

        reinforcerId: char('reinforcer_id', { length: 36 }).references(
            () => reinforcerTable.id,
            { onDelete: 'cascade', onUpdate: 'cascade' },
        ),
    },
    (table) => [
        primaryKey({
            columns: [table.clientSessionId, table.reinforcerId],
        }),
    ],
);

export const clientSessionReinforcerTableRelations = relations(
    clientSessionReinforcerTable,
    ({ one }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionReinforcerTable.clientSessionId],
            references: [clientSessionTable.id],
        }),

        reinforcer: one(reinforcerTable, {
            fields: [clientSessionReinforcerTable.reinforcerId],
            references: [reinforcerTable.id],
        }),
    }),
);
