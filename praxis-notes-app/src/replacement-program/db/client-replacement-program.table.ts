import { relations } from 'drizzle-orm';

import { table, char } from '@db/sql';

import { clientTable } from '@src/client/db';
import { clientReplacementProgramBehaviorTable } from './client-replacement-program-behavior.table';
import { replacementProgramTable } from '@db/db.tables';

/**
 * replacement programs assigned to clients
 */
export const clientReplacementProgramTable = table(
    'client_replacement_programs',
    {
        id: char('id', { length: 36 }).primaryKey(),

        clientId: char('client_id', { length: 36 })
            .references(() => clientTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        replacementProgramId: char('replacement_program_id', {
            length: 36,
        })
            .references(() => replacementProgramTable.id)
            .notNull(),
    },
);

export const clientReplacementProgramTableRelations = relations(
    clientReplacementProgramTable,

    ({ one, many }) => ({
        client: one(clientTable, {
            fields: [clientReplacementProgramTable.clientId],
            references: [clientTable.id],
        }),

        replacementProgram: one(replacementProgramTable, {
            fields: [clientReplacementProgramTable.replacementProgramId],
            references: [replacementProgramTable.id],
        }),

        behaviors: many(clientReplacementProgramBehaviorTable),
    }),
);
