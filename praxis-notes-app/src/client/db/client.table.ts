import { relations } from 'drizzle-orm';

import {
    table,
    char,
    varchar,
    boolean,
    bigint,
    enumType,
    sqlEnum,
} from '@db/sql';

import { clientGenderEnum } from '../enums';

import {
    organizationTable,
    userTable,
    clientBehaviorTable,
    clientInterventionTable,
    clientReplacementProgramTable,
} from '@db/db.tables';

export const genderEnum = enumType('gender', clientGenderEnum.options);

/**
 * clients
 */
export const clientTable = table('clients', {
    id: char('id', { length: 36 }).primaryKey(),

    organizationId: char('organization_id', { length: 36 })
        .references(() => organizationTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    firstName: varchar('first_name', { length: 255 }).notNull(),

    lastName: varchar('last_name', { length: 255 }).notNull(),

    gender: sqlEnum('gender', genderEnum),

    isActive: boolean('is_active').default(true).notNull(),

    isDraft: boolean('is_draft').default(false).notNull(),

    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    updatedAt: bigint('updated_at', {
        mode: 'number',
    }).notNull(),

    createdBy: char('created_by', { length: 36 })
        .references(() => userTable.id)
        .notNull(),
});

export const clientTableRelations = relations(clientTable, ({ one, many }) => ({
    organization: one(organizationTable, {
        fields: [clientTable.organizationId],
        references: [organizationTable.id],
    }),

    behaviors: many(clientBehaviorTable),

    replacementPrograms: many(clientReplacementProgramTable),

    interventions: many(clientInterventionTable),
}));
