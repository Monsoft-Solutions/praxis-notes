import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionReplacementProgramEntryTable } from '@src/client-session/db/client-session-replacement-program-entry.table';
import { promptTypeTable } from '@src/replacement-program/db';
/**
 * client session replacement program entry prompt type
 */
export const clientSessionReplacementProgramEntryPromptTypeTable = table(
    'client_session_replacement_program_entry_prompt_type',

    {
        id: char('id', { length: 36 }).primaryKey(),

        clientSessionReplacementProgramEntryId: char(
            'client_session_replacement_program_entry_id',
            {
                length: 36,
            },
        ).references(() => clientSessionReplacementProgramEntryTable.id, {
            onDelete: 'cascade',
        }),

        promptTypeId: char('prompt_type_id', { length: 36 }).references(
            () => promptTypeTable.id,
        ),
    },
);

export const clientSessionReplacementProgramEntryPromptTypeTableRelations =
    relations(
        clientSessionReplacementProgramEntryPromptTypeTable,

        ({ one }) => ({
            clientSessionReplacementProgramEntry: one(
                clientSessionReplacementProgramEntryTable,
                {
                    fields: [
                        clientSessionReplacementProgramEntryPromptTypeTable.clientSessionReplacementProgramEntryId,
                    ],
                    references: [clientSessionReplacementProgramEntryTable.id],
                },
            ),

            promptType: one(promptTypeTable, {
                fields: [
                    clientSessionReplacementProgramEntryPromptTypeTable.promptTypeId,
                ],
                references: [promptTypeTable.id],
            }),
        }),
    );
