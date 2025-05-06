import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { v4 as uuidv4 } from 'uuid';

import { chatSessionTable } from '../db';

import { emit } from '@events/providers';

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

            // emit event that will trigger the generation of suggested questions
            // listener will emit another event with the generated questions
            emit({
                event: 'suggestedQuestionsRequested',
                payload: {
                    sessionId,
                },
            });

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
