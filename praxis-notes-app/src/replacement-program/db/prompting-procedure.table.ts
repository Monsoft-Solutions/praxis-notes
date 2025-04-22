import { table, char, varchar } from '@db/sql';

/**
 * prompting procedures used in replacement programs
 */
export const promptingProcedureTable = table('prompting_procedure', {
    id: char('id', { length: 36 }).primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
});
