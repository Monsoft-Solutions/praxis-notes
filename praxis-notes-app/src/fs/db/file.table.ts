import { char, table, text } from '@db/sql';

// files
export const fileTable = table('file', {
    id: char('id', { length: 36 }).primaryKey(),

    // MIME type of the file
    type: text('type').notNull(),

    // name of the file
    name: text('name').notNull(),

    // hash of the file content
    hash: text('hash').notNull(),
});
