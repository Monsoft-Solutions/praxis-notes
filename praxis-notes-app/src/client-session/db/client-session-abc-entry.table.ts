import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionTable } from '@src/client-session/db/client-session.table';

import { antecedentTable } from '@src/antecedent/db';
import { clientBehaviorTable } from '@src/behavior/db';
import { clientInterventionTable } from '@src/intervention/db';

/**
 * client session abc entry
 */
export const clientSessionAbcEntryTable = table('client_session_abc_entry', {
    id: char('id', { length: 36 }).primaryKey(),

    clientSessionId: char('client_session_id', { length: 36 }).references(
        () => clientSessionTable.id,
        { onDelete: 'cascade' },
    ),

    antecedentId: char('antecedent_id', { length: 36 }).references(
        () => antecedentTable.id,
    ),

    clientBehaviorId: char('client_behavior_id', { length: 36 }).references(
        () => clientBehaviorTable.id,
    ),

    clientInterventionId: char('client_intervention_id', {
        length: 36,
    }).references(() => clientInterventionTable.id),
});

export const clientSessionAbcEntryTableRelations = relations(
    clientSessionAbcEntryTable,

    ({ one }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionAbcEntryTable.clientSessionId],
            references: [clientSessionTable.id],
        }),

        antecedent: one(antecedentTable, {
            fields: [clientSessionAbcEntryTable.antecedentId],
            references: [antecedentTable.id],
        }),

        clientBehavior: one(clientBehaviorTable, {
            fields: [clientSessionAbcEntryTable.clientBehaviorId],
            references: [clientBehaviorTable.id],
        }),

        clientIntervention: one(clientInterventionTable, {
            fields: [clientSessionAbcEntryTable.clientInterventionId],
            references: [clientInterventionTable.id],
        }),
    }),
);
