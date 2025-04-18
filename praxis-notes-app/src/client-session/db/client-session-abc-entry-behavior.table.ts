import { relations } from 'drizzle-orm';

import { char, table } from '@db/sql';

import { clientSessionAbcEntryTable } from '@src/client-session/db/client-session-abc-entry.table';
import { behaviorTable } from '@src/behavior/db';

/**
 * client session abc entry behavior
 */
export const clientSessionAbcEntryBehaviorTable = table(
    'client_session_abc_entry_behavior',

    {
        id: char('id', { length: 36 }).primaryKey(),

        clientSessionAbcEntryId: char('client_session_abc_entry_id', {
            length: 36,
        }).references(() => clientSessionAbcEntryTable.id, {
            onDelete: 'cascade',
        }),

        behaviorId: char('behavior_id', { length: 36 }).references(
            () => behaviorTable.id,
        ),
    },
);

export const clientSessionAbcEntryBehaviorTableRelations = relations(
    clientSessionAbcEntryBehaviorTable,

    ({ one }) => ({
        clientSessionAbcEntry: one(clientSessionAbcEntryTable, {
            fields: [
                clientSessionAbcEntryBehaviorTable.clientSessionAbcEntryId,
            ],
            references: [clientSessionAbcEntryTable.id],
        }),

        behavior: one(behaviorTable, {
            fields: [clientSessionAbcEntryBehaviorTable.behaviorId],
            references: [behaviorTable.id],
        }),
    }),
);
