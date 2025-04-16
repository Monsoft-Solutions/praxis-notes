import { relations } from 'drizzle-orm';

import { table, char, int, bigint, enumType, sqlEnum } from '@db/sql';

import { clientTable } from '@src/client/db';
import { behaviorTable } from './behavior.table';

import { clientBehaviorTypeEnum } from '../enums';

export const typeEnum = enumType(
    'client_behavior_type',
    clientBehaviorTypeEnum.options,
);

/**
 * behaviors assigned to client
 */
export const clientBehaviorTable = table('client_behavior', {
    id: char('id', { length: 36 }).primaryKey(),

    clientId: char('client_id', { length: 36 })
        .references(() => clientTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    behaviorId: char('behavior_id', { length: 36 })
        .references(() => behaviorTable.id)
        .notNull(),

    type: sqlEnum('type', typeEnum).notNull(),

    baseline: int('baseline').notNull(),

    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),
});

export const clientBehaviorTableRelations = relations(
    clientBehaviorTable,
    ({ one }) => ({
        client: one(clientTable, {
            fields: [clientBehaviorTable.clientId],
            references: [clientTable.id],
        }),

        behavior: one(behaviorTable, {
            fields: [clientBehaviorTable.behaviorId],
            references: [behaviorTable.id],
        }),
    }),
);
