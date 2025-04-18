import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionAbcEntryTable } from '@src/client-session/db/client-session-abc-entry.table';
import { interventionTable } from '@src/intervention/db';

/**
 * client session abc entry intervention
 */
export const clientSessionAbcEntryInterventionTable = table(
    'client_session_abc_entry_intervention',

    {
        id: char('id', { length: 36 }).primaryKey(),

        clientSessionAbcEntryId: char('client_session_abc_entry_id', {
            length: 36,
        }).references(() => clientSessionAbcEntryTable.id, {
            onDelete: 'cascade',
        }),

        interventionId: char('intervention_id', { length: 36 }).references(
            () => interventionTable.id,
        ),
    },
);

export const clientSessionAbcEntryInterventionTableRelations = relations(
    clientSessionAbcEntryInterventionTable,

    ({ one }) => ({
        clientSessionAbcEntry: one(clientSessionAbcEntryTable, {
            fields: [
                clientSessionAbcEntryInterventionTable.clientSessionAbcEntryId,
            ],
            references: [clientSessionAbcEntryTable.id],
        }),

        intervention: one(interventionTable, {
            fields: [clientSessionAbcEntryInterventionTable.interventionId],
            references: [interventionTable.id],
        }),
    }),
);
