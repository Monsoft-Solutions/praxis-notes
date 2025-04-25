import { relations } from 'drizzle-orm';

// import from the db base, not from drizzle
import { char, table, text, bigint, enumType, sqlEnum } from '@db/sql';

import { userTable } from '../../../bases/db/db.tables';

import { feedbackStatusEnum } from '../enums/feedback-status.enum';
import { feedbackTypeEnum } from '../enums/feedback-type.enum';

// feedback types as an SQL enum
export const feedbackTypeEnumSql = enumType(
    'feedback_type',
    feedbackTypeEnum.options,
);

// feedback status as an SQL enum
export const feedbackStatusEnumSql = enumType(
    'feedback_status',
    feedbackStatusEnum.options,
);

// feedback/suggestions from users
export const feedbackTable = table('feedback', {
    id: char('id', { length: 36 }).primaryKey(),

    // user who submitted the feedback
    userId: char('user_id', { length: 36 })
        .notNull()
        .references(() => userTable.id),

    // type of feedback (feature, improvement, ux, performance, other)
    type: sqlEnum('type', feedbackTypeEnumSql).notNull(),

    // feedback content
    text: text('text').notNull(),

    // timestamp when the feedback was submitted
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),

    // status of the feedback (pending, reviewed, implemented, rejected)
    status: sqlEnum('status', feedbackStatusEnumSql)
        .notNull()
        .default('pending'),
});

export const feedbackTableRelations = relations(feedbackTable, ({ one }) => ({
    // user who submitted the feedback
    user: one(userTable, {
        fields: [feedbackTable.userId],
        references: [userTable.id],
    }),
}));
