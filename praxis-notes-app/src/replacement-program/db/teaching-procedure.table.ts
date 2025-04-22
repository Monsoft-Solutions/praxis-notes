import { table, char, varchar } from '@db/sql';

/**
 * teaching procedures used in replacement programs
 */
export const teachingProcedureTable = table('teaching_procedure', {
    id: char('id', { length: 36 }).primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
});
