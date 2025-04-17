import { z } from 'zod';

import { publicEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { authenticationTable } from '@auth/db';

import { v4 as uuidv4 } from 'uuid';

import { eq } from 'drizzle-orm';
import { createSession } from '@auth/providers/server';

// verify email
// Input: id
export const verifyEmail = publicEndpoint
    .input(
        z.object({
            id: z.string(),
        }),
    )
    .mutation(
        queryMutationCallback(async ({ input: { id } }) => {
            const { data, error } = await catchError(
                db.transaction(async (tx) => {
                    const unverifiedEmail =
                        await tx.query.unverifiedEmailTable.findFirst({
                            where: (record) => eq(record.id, id),
                        });

                    if (!unverifiedEmail) throw 'UNVERIFIED_EMAIL_NOT_FOUND';

                    const { userId, email, password } = unverifiedEmail;

                    const authenticationId = uuidv4();

                    await tx.insert(authenticationTable).values({
                        id: authenticationId,
                        userId,

                        email,
                        password,
                    });

                    // init session
                    const { data: session, error: sessionError } =
                        await createSession({
                            userId,
                        });

                    if (sessionError) throw 'INIT_SESSION';

                    return {
                        email,
                        sessionId: session.id,
                    };
                }),
            );

            if (error) return Error();

            const { email, sessionId } = data;

            return Success({
                email,
                sessionId,
            });
        }),
    );
