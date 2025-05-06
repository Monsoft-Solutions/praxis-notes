import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { chatSuggestedQuestionTable } from '../db';

export const getSuggestedQuestions = protectedEndpoint
    .input(z.object({ sessionId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            // Get suggested questions for the session
            const { data: questions, error } = await catchError(
                db.query.chatSuggestedQuestionTable.findMany({
                    where: eq(chatSuggestedQuestionTable.sessionId, sessionId),
                    orderBy: chatSuggestedQuestionTable.createdAt,
                }),
            );

            if (error) return Error();

            return Success({ questions });
        }),
    );
