import { relations } from 'drizzle-orm';

import { table, char } from '@db/sql';

import { clientReplacementProgramTable } from './client-replacement-program.table';
import { behaviorTable } from '@src/behavior/db';

/**
 * Many-to-many relationship between client replacement programs and client behaviors
 */
export const clientReplacementProgramBehaviorTable = table(
    'client_replacement_program_behaviors',

    {
        id: char('id', { length: 36 }).primaryKey(),

        clientReplacementProgramId: char('client_replacement_program_id', {
            length: 36,
        })
            .references(() => clientReplacementProgramTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        behaviorId: char('behavior_id', { length: 36 })
            .references(() => behaviorTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),
    },
);

export const clientReplacementProgramBehaviorTableRelations = relations(
    clientReplacementProgramBehaviorTable,

    ({ one }) => ({
        clientReplacementProgram: one(clientReplacementProgramTable, {
            fields: [
                clientReplacementProgramBehaviorTable.clientReplacementProgramId,
            ],
            references: [clientReplacementProgramTable.id],
        }),

        behavior: one(behaviorTable, {
            fields: [clientReplacementProgramBehaviorTable.behaviorId],
            references: [behaviorTable.id],
        }),
    }),
);
