import { relations } from 'drizzle-orm';

import { table, varchar, text, char } from '@db/sql';

import { organizationTable } from '@db/db.tables';

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
});

export const behaviorTableRelations = relations(behaviorTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [behaviorTable.organizationId],
        references: [organizationTable.id],
    }),
}));
