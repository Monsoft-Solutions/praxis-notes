import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { v4 as uuidv4 } from 'uuid';

import { chatSessionTable, chatSuggestedQuestionTable } from '../db';

import { emit } from '@events/providers';
import { userTable } from '@db/db.tables';
import { eq } from 'drizzle-orm';
import { generateSuggestedQuestions } from '../utils/generate-suggested-questions.util';

export const createChatSession = protectedEndpoint.mutation(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // current timestamp
            const now = Date.now();

            const sessionId = uuidv4();

            // create the chat session object
            const chatSession = {
                id: sessionId,
                title: 'New Chat',
                userId: user.id,
                createdAt: now,
                updatedAt: now,
            };

            // insert the chat session into database
            const { error: sessionError } = await catchError(
                db.insert(chatSessionTable).values(chatSession),
            );

            // if insertion failed, return an error
            if (sessionError) return Error();

            // Get user information for generating suggested questions
            const { data: userData, error: userError } = await catchError(
                db.query.userTable.findFirst({
                    where: eq(userTable.id, user.id),
                    columns: {
                        firstName: true,
                        language: true,
                    },
                }),
            );

            if (userError) return Error();

            const userName = userData?.firstName ?? 'User';
            const userLanguage = userData?.language ?? 'en';

            // Generate suggested questions
            const { data: suggestedQuestions, error: suggestionsError } =
                await generateSuggestedQuestions({
                    userName,
                    userLanguage,
                });

            if (suggestionsError) {
                // If we fail to generate questions, continue with the session creation
                // but log the error
                console.error(
                    'Failed to generate suggested questions:',
                    suggestionsError,
                );
            } else if (suggestedQuestions) {
                // Store each suggested question in the database
                const suggestedQuestionsPromises = suggestedQuestions.map(
                    (questionText) => {
                        const questionId = uuidv4();
                        return catchError(
                            db.insert(chatSuggestedQuestionTable).values({
                                id: questionId,
                                sessionId,
                                questionText,
                                createdAt: now,
                            }),
                        );
                    },
                );

                // Wait for all insertions to complete
                await Promise.all(suggestedQuestionsPromises);

                // Emit event for each suggested question
                // for (const questionText of suggestedQuestions) {
                //     emit({
                //         event: 'chatSuggestedQuestionCreated',
                //         payload: {
                //             sessionId,
                //             questionText,
                //         },
                //     });
                // }
            }

            // emit the new chat session created event
            emit({
                event: 'chatSessionCreated',
                payload: chatSession,
            });

            // return the created chat session
            return Success({ sessionId });
        },
    ),
);
