import { z } from 'zod';

import { publicEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { authenticationTable, unverifiedEmailTable } from '@auth/db';

import { v4 as uuidv4 } from 'uuid';

import { eq } from 'drizzle-orm';
import { createSession } from '@auth/providers/server';
import { logger } from '@logger/providers/logger.provider';
import { addSubscriberToWelcomeCampaign } from '@email/utils/mailer-lite.util';
import { addToAudienceResend } from '@email/utils/resend-add-to-audience.util';

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

                    // delete unverified email, no longer needed
                    await tx
                        .delete(unverifiedEmailTable)
                        .where(eq(unverifiedEmailTable.id, id));

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

                    logger.info('Email verified', {
                        email,
                        id,
                    });

                    return {
                        email,
                        sessionId: session.id,
                        userId,
                    };
                }),
            );

            if (error) return Error();

            const { email, sessionId, userId } = data;

            // Get user information for MailerLite
            const userResult = await catchError(
                db.query.userTable.findFirst({
                    where: (record) => eq(record.id, userId),
                }),
            );

            if (userResult.error) {
                logger.error(
                    'Failed to retrieve user for MailerLite integration',
                    {
                        userId,
                        error: userResult.error,
                    },
                );

                return Error('FAILED_TO_RETRIEVE_USER');
            } else if (userResult.data) {
                // Add user to MailerLite welcome campaign
                const { error: mailerLiteError } =
                    await addSubscriberToWelcomeCampaign({
                        email,
                        name: `${userResult.data.firstName} ${userResult.data.lastName}`,
                    });

                if (mailerLiteError !== null) {
                    // Log error but don't fail the request
                    logger.error(
                        'Failed to add user to MailerLite welcome campaign',
                        {
                            errorCode: mailerLiteError,
                            email,
                        },
                    );

                    return Error('FAILED_TO_ADD_TO_MAILERLITE');
                }

                const { error: resendError } = await addToAudienceResend({
                    email,
                    firstName: userResult.data.firstName,
                    lastName: userResult.data.lastName ?? '',
                });

                if (resendError !== null) {
                    // Log error but don't fail the request
                    logger.error('Failed to add user to Resend audience', {
                        errorCode: resendError,
                        email,
                    });

                    return Error('FAILED_TO_ADD_TO_RESEND');
                }
            }

            return Success({
                email,
                sessionId,
            });
        }),
    );
