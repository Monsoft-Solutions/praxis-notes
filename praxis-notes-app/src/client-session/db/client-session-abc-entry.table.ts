import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionTable } from '@src/client-session/db/client-session.table';

import { antecedentTable } from '@src/antecedent/db';
import { behaviorTable } from '@src/behavior/db';
import { interventionTable } from '@src/intervention/db';

/**
 * client session abc entry
 */
export const clientSessionAbcEntryTable = table('client_session_abc_entry', {
    id: char('id', { length: 36 }).primaryKey(),

    clientSessionId: char('client_session_id', { length: 36 }).references(
        () => clientSessionTable.id,
    ),

    antecedentId: char('antecedent_id', { length: 36 }).references(
        () => antecedentTable.id,
    ),

    behaviorId: char('behavior_id', { length: 36 }).references(
        () => behaviorTable.id,
    ),

    interventionId: char('intervention_id', { length: 36 }).references(
        () => interventionTable.id,
    ),
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

        behavior: one(behaviorTable, {
            fields: [clientSessionAbcEntryTable.behaviorId],
            references: [behaviorTable.id],
        }),

        intervention: one(interventionTable, {
            fields: [clientSessionAbcEntryTable.interventionId],
            references: [interventionTable.id],
        }),
    }),
);
