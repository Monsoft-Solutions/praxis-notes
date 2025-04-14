import { relations } from 'drizzle-orm';

import { table, char, varchar, text, bigint } from '@db/sql';

import { organizationTable } from '@db/db.tables';
import { userTable } from '@db/db.tables';

/**
 * replacement programs that can be assigned to clients to replace challenging behaviors
 */
export const replacementProgramTable = table('replacement_programs', {
    id: char('id', { length: 36 }).primaryKey(),

    // If organizationId is null, the replacement program is considered global
    organizationId: char('organization_id', { length: 36 }).references(
        () => organizationTable.id,
        {
            onDelete: 'set null',
        },
    ),

    name: varchar('name', { length: 255 }).notNull(),

    description: text('description'),

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

export const replacementProgramTableRelations = relations(
    replacementProgramTable,
    ({ one }) => ({
        organization: one(organizationTable, {
            fields: [replacementProgramTable.organizationId],
            references: [organizationTable.id],
        }),

        creator: one(userTable, {
            fields: [replacementProgramTable.createdBy],
            references: [userTable.id],
        }),

        updater: one(userTable, {
            fields: [replacementProgramTable.updatedBy],
            references: [userTable.id],
        }),
    }),
);
