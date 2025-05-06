import { relations } from 'drizzle-orm';

// import from the db base, not from drizzle
import { char, table, varchar, bigint } from '@db/sql';

import { chatSessionTable } from './chat-session.table';

// TODO: add a column to store the selected question by the user
// suggested questions for chat sessions
export const chatSuggestedQuestionTable = table('chat_suggested_question', {
    // unique identifier for the suggested question
    id: char('id', { length: 36 }).primaryKey(),

    // associated chat session
    sessionId: char('session_id', { length: 36 })
        .notNull()
        .references(() => chatSessionTable.id),

    // the question text to display to the user
    questionText: varchar('question_text', { length: 255 }).notNull(),

    // timestamp when the question was created
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),
});

export const chatSuggestedQuestionTableRelations = relations(
    chatSuggestedQuestionTable,
    ({ one }) => ({
        // chat session this question belongs to
        session: one(chatSessionTable, {
            fields: [chatSuggestedQuestionTable.sessionId],
            references: [chatSessionTable.id],
        }),
    }),
);
