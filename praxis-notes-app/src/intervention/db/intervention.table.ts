import { relations } from 'drizzle-orm';

import { table, char, varchar, text, bigint } from '@db/sql';

import { organizationTable } from '@db/db.tables';
import { userTable } from '@db/db.tables';

/**
 * interventions that can be assigned to clients
 */
export const interventionTable = table('interventions', {
    id: char('id', { length: 36 }).primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),

    description: text('description'),

    category: varchar('category', { length: 100 }),

    // If null, the intervention is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        {
            onDelete: 'cascade',
        },
    ),

    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),

    createdBy: char('created_by', { length: 36 })
        .references(() => userTable.id)
        .notNull(),

    updatedBy: char('updated_by', { length: 36 })
        .references(() => userTable.id)
        .notNull(),
});

export const interventionTableRelations = relations(
    interventionTable,

    ({ one }) => ({
        organization: one(organizationTable, {
            fields: [interventionTable.organizationId],
            references: [organizationTable.id],
        }),

        creator: one(userTable, {
            fields: [interventionTable.createdBy],
            references: [userTable.id],
        }),

        updater: one(userTable, {
            fields: [interventionTable.updatedBy],
            references: [userTable.id],
        }),
    }),
);
