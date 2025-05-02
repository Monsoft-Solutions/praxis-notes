import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { eq, asc } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { chatSessionTable, chatMessageTable } from '../db';

export const getChatSession = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            // get the session
            const { data: session, error: sessionError } = await catchError(
                db.query.chatSessionTable.findFirst({
                    where: eq(chatSessionTable.id, sessionId),
                    with: {
                        messages: {
                            orderBy: asc(chatMessageTable.createdAt),
                        },
                    },
                }),
            );

            if (sessionError) return Error();

            if (!session) return Error();

            return Success(session);
        }),
    );
