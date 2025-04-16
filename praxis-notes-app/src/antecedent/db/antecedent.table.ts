import { relations } from 'drizzle-orm';

import { char, table, varchar, text } from '@db/sql';

import { organizationTable } from '@db/db.tables';

/**
 * antecedents
 */
export const antecedentTable = table('antecedent', {
    id: char('id', { length: 36 }).primaryKey(),

    // if null, the behavior is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        { onDelete: 'cascade' },
    ),

    name: varchar('name', { length: 255 }).notNull(),

    description: text('description'),
});

export const antecedentTableRelations = relations(
    antecedentTable,

    () => ({}),
);
