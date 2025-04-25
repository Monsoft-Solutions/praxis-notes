import { relations } from 'drizzle-orm';

// import from the db base, not from drizzle
import { char, table, varchar, text, bigint, enumType, sqlEnum } from '@db/sql';

import { userTable } from '../../../bases/db/db.tables';

import { bugStatusEnum } from '../enums/bug-status.enum';
import { bugSeverityEnum } from '../enums/bug-severity.enum';
import { appAreaEnum } from '../enums/app-area.enum';

// bug severity as an SQL enum
export const bugSeverityEnumSql = enumType(
    'bug_severity',
    bugSeverityEnum.options,
);

// app area as an SQL enum
export const appAreaEnumSql = enumType('app_area', appAreaEnum.options);

// bug status as an SQL enum
export const bugStatusEnumSql = enumType('bug_status', bugStatusEnum.options);

// bug reports from users
export const bugReportTable = table('bug_report', {
    id: char('id', { length: 36 }).primaryKey(),

    // user who submitted the bug report
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // title of the bug report
    title: varchar('title', { length: 255 }).notNull(),

    // detailed description of the bug
    description: text('description').notNull(),

    // steps to reproduce the bug
    stepsToReproduce: text('steps_to_reproduce'),

    // area of the application where the bug occurs
    area: sqlEnum('area', appAreaEnumSql),

    // severity of the bug
    severity: sqlEnum('severity', bugSeverityEnumSql),

    // path to screenshot if provided
    screenshotPath: varchar('screenshot_path', { length: 255 }),

    // timestamp when the bug report was submitted
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    // status of the bug report (pending, investigating, fixed, rejected)
    status: sqlEnum('status', bugStatusEnumSql).notNull().default('pending'),
});

export const bugReportTableRelations = relations(bugReportTable, ({ one }) => ({
    // user who submitted the bug report
    user: one(userTable, {
        fields: [bugReportTable.userId],
        references: [userTable.id],
    }),
}));
