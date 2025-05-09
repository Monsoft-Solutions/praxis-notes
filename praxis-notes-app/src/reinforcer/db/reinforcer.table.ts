import { relations } from 'drizzle-orm';

import { char, table, varchar } from '@db/sql';

import { organizationTable } from '@db/db.tables';

/**
 * reinforcers
 */
export const reinforcerTable = table('reinforcer', {
    id: char('id', { length: 36 }).primaryKey(),

    // if null, the reinforcer is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        { onDelete: 'cascade' },
    ),

    name: varchar('name', { length: 255 }).notNull(),
});

export const reinforcerTableRelations = relations(
    reinforcerTable,

    () => ({}),
);
