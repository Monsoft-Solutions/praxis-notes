import { relations } from 'drizzle-orm';

import { table, char, varchar, text } from '@db/sql';

import { organization } from '@db/db.tables';

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
        () => organization.id,
        {
            onDelete: 'cascade',
        },
    ),
});

export const interventionTableRelations = relations(
    interventionTable,

    ({ one }) => ({
        organization: one(organization, {
            fields: [interventionTable.organizationId],
            references: [organization.id],
        }),
    }),
);
