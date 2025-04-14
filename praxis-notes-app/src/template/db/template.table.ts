import { relations } from 'drizzle-orm';
import { char, enumType, sqlEnum, table, varchar } from '@db/sql';

import { userTable } from '../../../bases/db/db.tables';

import { templateStatusEnum } from '../enums';

export const statusEnum = enumType(
    'template_status',
    templateStatusEnum.options,
);

// templates
export const templateTable = table('template', {
    id: char('id', { length: 36 }).primaryKey(),

    // short name of the template
    name: varchar('name', { length: 255 }).unique().notNull(),

    // creator of the template
    creator: char('creator', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // current status of the template
    status: sqlEnum('status', statusEnum).notNull().default('draft'),
});

export const templateTableRelations = relations(templateTable, ({ one }) => ({
    // creator of the template
    creator: one(userTable, {
        fields: [templateTable.creator],
        references: [userTable.id],
    }),
}));
