import { relations } from 'drizzle-orm';

import { table, char, varchar, text } from '@db/sql';

import { organization } from '@db/db.tables';

/**
 * replacement programs that can be assigned to clients to replace challenging behaviors
 */
export const replacementProgramTable = table('replacement_programs', {
    id: char('id', { length: 36 }).primaryKey(),

    // If organizationId is null, the replacement program is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organization.id,
        {
            onDelete: 'cascade',
        },
    ),

    name: varchar('name', { length: 255 }).notNull(),

    description: text('description'),
});

export const replacementProgramTableRelations = relations(
    replacementProgramTable,
    ({ one }) => ({
        organization: one(organization, {
            fields: [replacementProgramTable.organizationId],
            references: [organization.id],
        }),
    }),
);
