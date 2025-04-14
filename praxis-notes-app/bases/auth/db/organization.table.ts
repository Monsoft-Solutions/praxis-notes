import { char, table, varchar } from '@db/sql';

// Organization table
export const organizationTable = table('organizations', {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
});
