import { relations } from 'drizzle-orm';

import { char, table, varchar, text } from '@db/sql';

import { organizationTable } from '@db/db.tables';

/**
 * locations
 */
export const locationTable = table('location', {
    id: char('id', { length: 36 }).primaryKey(),

    // organization that owns this location
    organizationId: char('organization_id', { length: 36 })
        .references(() => organizationTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    // name of the location
    name: varchar('name', { length: 255 }).notNull(),

    // optional description of the location
    description: text('description'),
});

export const locationTableRelations = relations(locationTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [locationTable.organizationId],
        references: [organizationTable.id],
    }),
}));
