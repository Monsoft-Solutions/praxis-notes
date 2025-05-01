import { relations } from 'drizzle-orm';
import { boolean, char, enumType, sqlEnum, table, varchar } from '@db/sql';

import { organizationTable } from './organization.table';
import { userRoleTable } from '../../guard/db';
import { authenticationTable } from './authentication.table';

import { userLangEnumSchema } from '../enum/user-lang.enum';

export const userLang = enumType('user_lang', userLangEnumSchema.options);

// User table
// organization users
export const userTable = table('users', {
    id: char('id', { length: 36 }).primaryKey(),
    organizationId: char('organization_id', { length: 36 })
        .notNull()
        .references(() => organizationTable.id, { onDelete: 'cascade' }),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lastName: varchar('lastName', { length: 255 }),

    // user preferred language ('en' or 'es')
    language: sqlEnum('language', userLang).default('en'),

    bookmarked: boolean('bookmarked').default(false),

    hasDoneTour: boolean('has_done_tour').notNull().default(true),
});

export const userTableRelations = relations(userTable, ({ many }) => ({
    roles: many(userRoleTable),

    authentications: many(authenticationTable),
}));
