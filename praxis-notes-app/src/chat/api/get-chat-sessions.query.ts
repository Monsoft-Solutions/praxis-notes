import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { desc, eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { chatSessionTable } from '../db';

export const getChatSessions = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // get the chat sessions for this user
            const { data: sessions, error } = await catchError(
                db.query.chatSessionTable.findMany({
                    where: (record) => eq(record.userId, user.id),
                    orderBy: desc(chatSessionTable.updatedAt),
                }),
            );

            if (error) return Error();

            // return the chat sessions
            return Success(sessions);
        },
    ),
);
