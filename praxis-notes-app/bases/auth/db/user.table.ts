import { relations } from 'drizzle-orm';
import { boolean, char, table, varchar } from '@db/sql';

import { organizationTable } from './organization.table';
import { userRoleTable } from '../../guard/db';
import { authenticationTable } from './authentication.table';

// User table
// organization users
export const userTable = table('users', {
    id: char('id', { length: 36 }).primaryKey(),
    organizationId: char('organization_id', { length: 36 })
        .notNull()
        .references(() => organizationTable.id, { onDelete: 'cascade' }),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lastName: varchar('lastName', { length: 255 }),

    bookmarked: boolean('bookmarked').default(false),

    hasDoneTour: boolean('has_done_tour').notNull().default(true),
});

export const userTableRelations = relations(userTable, ({ many }) => ({
    roles: many(userRoleTable),

    authentications: many(authenticationTable),
}));
