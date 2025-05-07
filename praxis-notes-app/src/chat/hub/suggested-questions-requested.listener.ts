import { v4 as uuidv4 } from 'uuid';

import { throwAsync } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { emit } from '@events/providers';

import { listen } from '@events/providers/listen.provider';

import { db } from '@db/providers/server';

import { chatSessionTable, chatSuggestedQuestionTable } from '../db';

import { generateSuggestedQuestions } from '../utils/generate-suggested-questions.util';
import { eq } from 'drizzle-orm';

void listen('suggestedQuestionsRequested', async ({ sessionId }) => {
    // get the session
    const { data: session, error: sessionError } = await catchError(
        db.query.chatSessionTable.findFirst({
            where: eq(chatSessionTable.id, sessionId),

            with: {
                user: true,
            },
        }),
    );

    if (sessionError) {
        throwAsync('SUGGESTED_QUESTIONS_SESSION_ERROR');
        return;
    }

    if (!session) {
        throwAsync('CHAT_SESSION_NOT_FOUND');
        return;
    }

    const { firstName, lastName, language, id } = session.user;

    // Generate suggested questions
    const { data: generatedQuestions, error: generateError } =
        await generateSuggestedQuestions({
            userBasicData: {
                firstName,
                lastName,
                language: language ?? 'en',
                userId: id,
            },
        });

    if (generateError) {
        throwAsync('SUGGESTED_QUESTIONS_GENERATION_ERROR');
        return;
    }

    const questions = generatedQuestions.map((question) => ({
        id: uuidv4(),
        questionText: question,
    }));

    const { error: insertQuestionsError } = await catchError(
        db.transaction(async (tx) => {
            await Promise.all(
                questions.map(async (question) => {
                    // Store each suggested question in the database

                    await tx.insert(chatSuggestedQuestionTable).values({
                        ...question,
                        sessionId,
                        createdAt: Date.now(),
                    });
                }),
            );
        }),
    );

    if (insertQuestionsError) {
        throwAsync('SUGGESTED_QUESTIONS_INSERT_ERROR');
        return;
    }

    // emit a suggested-questions-generated event
    emit({
        event: 'suggestedQuestionsGenerated',
        payload: {
            sessionId,
            questions,
        },
    });
});
