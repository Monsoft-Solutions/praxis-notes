import { table, char, varchar } from '@db/sql';

/**
 * types of prompts used in replacement programs
 */
export const promptTypeTable = table('prompt_type', {
    id: char('id', { length: 36 }).primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),
});
