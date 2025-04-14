import { relations } from 'drizzle-orm';

import { table, char, bigint } from '@db/sql';

import { clientTable } from '@src/client/db';
import { interventionTable } from './intervention.table';

/**
 * interventions assigned to clients
 */
export const clientInterventionTable = table('client_intervention', {
    id: char('id', { length: 36 }).primaryKey(),

    clientId: char('client_id', { length: 36 })
        .references(() => clientTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    interventionId: char('intervention_id', { length: 36 })
        .references(() => interventionTable.id)
        .notNull(),

    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),
});

export const clientInterventionTableRelations = relations(
    clientInterventionTable,

    ({ one }) => ({
        client: one(clientTable, {
            fields: [clientInterventionTable.clientId],
            references: [clientTable.id],
        }),
    }),
);
