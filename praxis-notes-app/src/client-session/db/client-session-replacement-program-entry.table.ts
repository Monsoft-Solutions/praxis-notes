import { relations } from 'drizzle-orm';

import { char, table, enumType, sqlEnum, int } from '@db/sql';

import { clientSessionTable } from '@src/client-session/db/client-session.table';

import {
    promptingProcedureTable,
    teachingProcedureTable,
    replacementProgramTable,
} from '@src/replacement-program/db';

import { clientSessionReplacementProgramEntryPromptTypeTable } from '@src/client-session/db/client-session-replacement-program-entry-prompt-type.table';
import { replacementProgramResponseEnum } from '@src/replacement-program/enums';
import { clientSessionAbcEntryTable } from './client-session-abc-entry.table';

export const replacementProgramResponse = enumType(
    'client_session_replacement_program_entry_response',
    replacementProgramResponseEnum.options,
);

/**
 * client session replacement program entry
 */
export const clientSessionReplacementProgramEntryTable = table(
    'client_session_replacement_program_entry',
    {
        id: char('id', { length: 36 }).primaryKey(),

        clientSessionId: char('client_session_id', { length: 36 })
            .references(() => clientSessionTable.id, { onDelete: 'cascade' })
            .notNull(),

        replacementProgramId: char('replacement_program_id', {
            length: 36,
        })
            .references(() => replacementProgramTable.id)
            .notNull(),

        teachingProcedureId: char('teaching_procedure_id', {
            length: 36,
        }).references(() => teachingProcedureTable.id),

        promptingProcedureId: char('prompting_procedure_id', {
            length: 36,
        }).references(() => promptingProcedureTable.id),

        clientResponse: sqlEnum('client_response', replacementProgramResponse),

        progress: int('progress'),

        // Link to an ABC entry
        linkedAbcEntryId: char('linked_abc_entry_id', {
            length: 36,
        }).references(() => clientSessionAbcEntryTable.id, {
            onDelete: 'set null',
        }),
    },
);

export const clientSessionReplacementProgramEntryTableRelations = relations(
    clientSessionReplacementProgramEntryTable,

    ({ one, many }) => ({
        clientSession: one(clientSessionTable, {
            fields: [clientSessionReplacementProgramEntryTable.clientSessionId],
            references: [clientSessionTable.id],
        }),

        replacementProgram: one(replacementProgramTable, {
            fields: [
                clientSessionReplacementProgramEntryTable.replacementProgramId,
            ],
            references: [replacementProgramTable.id],
        }),

        teachingProcedure: one(teachingProcedureTable, {
            fields: [
                clientSessionReplacementProgramEntryTable.teachingProcedureId,
            ],
            references: [teachingProcedureTable.id],
        }),

        promptingProcedure: one(promptingProcedureTable, {
            fields: [
                clientSessionReplacementProgramEntryTable.promptingProcedureId,
            ],
            references: [promptingProcedureTable.id],
        }),

        linkedAbcEntry: one(clientSessionAbcEntryTable, {
            fields: [
                clientSessionReplacementProgramEntryTable.linkedAbcEntryId,
            ],
            references: [clientSessionAbcEntryTable.id],
        }),

        promptTypes: many(clientSessionReplacementProgramEntryPromptTypeTable),
    }),
);
