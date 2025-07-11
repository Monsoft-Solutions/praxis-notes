import { relations } from 'drizzle-orm';

import { char, enumType, table, varchar, text } from '@db/sql';

import { clientTable, user } from '@db/db.tables';

import { clientSessionValuationEnum } from '../enum';

import { clientSessionParticipantTable } from './client-session-participant.table';
import { clientSessionEnvironmentalChangeTable } from './client-session-environmental-change.table';
import { clientSessionAbcEntryTable } from './client-session-abc-entry.table';
import { clientSessionReplacementProgramEntryTable } from './client-session-replacement-program-entry.table';
import { clientSessionReinforcerTable } from './client-session-reinforcer.table';

export const clientSessionValuation = enumType(
    'client_session_valuation',
    clientSessionValuationEnum.options,
);

/**
 * client sessions
 */
export const clientSessionTable = table('client_session', {
    id: char('id', { length: 36 }).primaryKey(),

    // client treated in the session
    clientId: char('client_id', { length: 36 })
        .references(() => clientTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    // user/therapist who conducted the session
    userId: char('user_id', { length: 36 })
        .references(() => user.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    sessionDate: varchar('session_date', { length: 255 }).notNull(),

    startTime: varchar('start_time', { length: 10 }).notNull(),

    endTime: varchar('end_time', { length: 10 }).notNull(),

    location: varchar('location', { length: 255 }).notNull(),

    valuation: clientSessionValuation('valuation').notNull(),

    observations: text('observations'),

    notes: text('notes'),
});

export const clientSessionTableRelations = relations(
    clientSessionTable,

    ({ one, many }) => ({
        client: one(clientTable, {
            fields: [clientSessionTable.clientId],
            references: [clientTable.id],
        }),

        participants: many(clientSessionParticipantTable),
        environmentalChanges: many(clientSessionEnvironmentalChangeTable),
        abcEntries: many(clientSessionAbcEntryTable),
        replacementProgramEntries: many(
            clientSessionReplacementProgramEntryTable,
        ),

        user: one(user, {
            fields: [clientSessionTable.userId],
            references: [user.id],
        }),

        reinforcers: many(clientSessionReinforcerTable),
    }),
);
