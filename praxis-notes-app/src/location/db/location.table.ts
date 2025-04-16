import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { organizationTable } from '@db/db.tables';

/**
 * locations
 */
export const locationTable = table('location', {
    id: char('id', { length: 36 }).primaryKey(),

    // organization that owns this location
    // if not set, it is a global location
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        {
            onDelete: 'cascade',
        },
    ),

    // name of the location
    name: varchar('name', { length: 255 }).notNull(),

    // optional description of the location
    description: varchar('description', { length: 1000 }),

    // optional address of the location
    address: varchar('address', { length: 500 }),
});

export const locationTableRelations = relations(locationTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [locationTable.organizationId],
        references: [organizationTable.id],
    }),
}));
