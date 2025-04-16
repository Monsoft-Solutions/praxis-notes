import { relations } from 'drizzle-orm';

import { table, varchar, text, char, bigint } from '@db/sql';

import { organizationTable } from '@db/db.tables';
import { userTable } from '@db/db.tables';

/**
 * behaviors that clients may have
 */
export const behaviorTable = table('behavior', {
    id: char('id', { length: 36 }).primaryKey(),

    // if null, the behavior is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        { onDelete: 'cascade' },
    ),

    name: varchar('name', { length: 255 }).notNull(),

    description: text('description'),

    createdBy: char('created_by', { length: 36 })
        .references(() => userTable.id)
        .notNull(),

    updatedBy: char('updated_by', { length: 36 })
        .references(() => userTable.id)
        .notNull(),

    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),
});

export const behaviorTableRelations = relations(behaviorTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [behaviorTable.organizationId],
        references: [organizationTable.id],
    }),

    creator: one(userTable, {
        fields: [behaviorTable.createdBy],
        references: [userTable.id],
    }),

    updater: one(userTable, {
        fields: [behaviorTable.updatedBy],
        references: [userTable.id],
    }),
}));
