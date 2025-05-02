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
            } else if (userResult.data) {
                // Run marketing integrations in parallel without blocking the verification flow
                const firstName = userResult.data.firstName;
                const lastName = userResult.data.lastName ?? '';
                const language = userResult.data.language ?? 'en';

                // We're using || instead of ?? here because we want to use 'en' as default
                // even if language is an empty string, not just if it's null or undefined
                // Use Promise.allSettled to handle both integrations in parallel
                const [mailerLiteResult, resendResult] =
                    await Promise.allSettled([
                        addSubscriberToWelcomeCampaign({
                            email,
                            name: `${firstName} ${lastName}`,
                            language,
                        }),
                        addToAudienceResend({
                            email,
                            firstName,
                            lastName,
                        }),
                    ]);

                // Log errors but don't block the verification flow
                if (mailerLiteResult.status === 'rejected') {
                    logger.error(
                        'Failed to add user to MailerLite welcome campaign',
                        {
                            error: mailerLiteResult.reason,
                            email,
                        },
                    );
                } else if (mailerLiteResult.value.error) {
                    logger.error(
                        'Failed to add user to MailerLite welcome campaign',
                        {
                            error: mailerLiteResult.value.error,
                            email,
                        },
                    );
                }

                if (resendResult.status === 'rejected') {
                    logger.error('Failed to add user to Resend audience', {
                        error: resendResult.reason,
                        email,
                    });
                } else if (resendResult.value.error) {
                    logger.error('Failed to add user to Resend audience', {
                        error: resendResult.value.error,
                        email,
                    });
                }
            }

            return Success({
                email,
                sessionId,
            });
        }),
    );
