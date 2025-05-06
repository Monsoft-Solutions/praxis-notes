import { relations } from 'drizzle-orm';

import { table, char, bigint } from '@db/sql';

import { clientInterventionTable } from './client-intervention.table';
import { behaviorTable } from '@src/behavior/db';

/**
 * many-to-many relationship between client behaviors and client interventions
 */
export const clientBehaviorInterventionTable = table(
    'client_behavior_intervention',

    {
        id: char('id', { length: 36 }).primaryKey(),

        clientInterventionId: char('client_intervention_id', { length: 36 })
            .references(() => clientInterventionTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        behaviorId: char('behavior_id', { length: 36 })
            .references(() => behaviorTable.id, {
                onDelete: 'cascade',
            })
            .notNull(),

        createdAt: bigint('created_at', {
            mode: 'number',
        }).notNull(),
    },
);

export const clientBehaviorInterventionTableRelations = relations(
    clientBehaviorInterventionTable,

    ({ one }) => ({
        clientIntervention: one(clientInterventionTable, {
            fields: [clientBehaviorInterventionTable.clientInterventionId],
            references: [clientInterventionTable.id],
        }),

        behavior: one(behaviorTable, {
            fields: [clientBehaviorInterventionTable.behaviorId],
            references: [behaviorTable.id],
        }),
    }),
);
