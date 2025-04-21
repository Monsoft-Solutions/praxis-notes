import { relations } from 'drizzle-orm';

import { char, enumType, sqlEnum, table } from '@db/sql';

import { clientSessionTable } from '@src/client-session/db/client-session.table';

import { antecedentTable } from '@src/antecedent/db';

import { clientSessionAbcEntryInterventionTable } from '@src/client-session/db/client-session-abc-entry-intervention.table';
import { clientSessionAbcEntryBehaviorTable } from '@src/client-session/db/client-session-abc-entry-behavior.table';

import { abcFunctionEnum } from '@src/client-session/enum';

export const abcFunction = enumType(
    'client_session_abc_entry_function',
    abcFunctionEnum.options,
);

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

    function: sqlEnum('function', abcFunction).notNull(),
});

export const clientSessionAbcEntryTableRelations = relations(
    clientSessionAbcEntryTable,

    ({ one, many }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionAbcEntryTable.clientSessionId],
            references: [clientSessionTable.id],
        }),

        antecedent: one(antecedentTable, {
            fields: [clientSessionAbcEntryTable.antecedentId],
            references: [antecedentTable.id],
        }),

        behaviors: many(clientSessionAbcEntryBehaviorTable),

        interventions: many(clientSessionAbcEntryInterventionTable),
    }),
);
