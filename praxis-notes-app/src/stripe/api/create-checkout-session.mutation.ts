import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';

import { stripe } from '@src/stripe/config/stripe';
import { db } from '@db/providers/server';
import { stripeCustomerTable } from '../db';
import { authenticationTable, userTable } from '@db/db.tables';
import { Success } from '@errors/utils';
import { connectionEnv } from '@env/constants/connection-env.constant';

const CreateCheckoutSessionInput = z.object({
    priceId: z.string(),
    quantity: z.number().int().min(1).default(1),
});

export const createCheckoutSession = protectedEndpoint
    .input(CreateCheckoutSessionInput)
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user: sessionUser },
                },
                input: { priceId, quantity },
            }) => {
                // Fetch user details needed for Stripe customer
                const userResult = await catchError(
                    db
                        .select({
                            id: userTable.id,
                            email: authenticationTable.email,
                            firstName: userTable.firstName,
                            lastName: userTable.lastName,
                        })
                        .from(userTable)
                        .where(eq(userTable.id, sessionUser.id))
                        .leftJoin(
                            authenticationTable,
                            eq(userTable.id, authenticationTable.userId),
                        ),
                );

                console.log('createCheckoutSession - userResult', userResult);

                if (userResult.error || userResult.data.length === 0) {
                    console.error(
                        'DB Error fetching user details:',
                        userResult.error,
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch user details.',
                    });
                }
                const user = userResult.data[0];

                if (!user.email) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'User email is not configured.',
                    });
                }

                const fqdn = connectionEnv.MSS_FQDN;
                if (!fqdn) {
                    console.error('MSS_FQDN environment variable is not set.');
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Application FQDN is not configured.',
                    });
                }
                const successUrl = `${fqdn}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${fqdn}/payment/cancel`;

                console.log('createCheckoutSession - successUrl', successUrl);
                console.log('createCheckoutSession - cancelUrl', cancelUrl);

                let stripeCustomerId: string;

                // --- Find or Create Stripe Customer ---
                const customerMappingResult = await catchError(
                    db
                        .select({
                            stripeCustomerId:
                                stripeCustomerTable.stripeCustomerId,
                        })
                        .from(stripeCustomerTable)
                        .where(eq(stripeCustomerTable.userId, user.id)),
                );

                console.log(
                    'createCheckoutSession - customerMappingResult',
                    customerMappingResult,
                );

                if (customerMappingResult.error) {
                    console.error(
                        'DB Error fetching Stripe customer mapping:',
                        customerMappingResult.error,
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Database error checking for Stripe customer.',
                    });
                }

                if (customerMappingResult.data.length > 0) {
                    stripeCustomerId =
                        customerMappingResult.data[0].stripeCustomerId;
                } else {
                    const createCustomerResult = await catchError(
                        stripe.customers.create({
                            email: user.email,
                            name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
                            metadata: {
                                userId: user.id,
                            },
                        }),
                    );

                    console.log(
                        'createCheckoutSession - createCustomerResult',
                        createCustomerResult,
                    );

                    if (createCustomerResult.error) {
                        console.error(
                            'Stripe Error creating customer:',
                            createCustomerResult.error,
                        );
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create Stripe customer.',
                        });
                    }
                    stripeCustomerId = createCustomerResult.data.id;

                    const insertMappingResult = await catchError(
                        db.insert(stripeCustomerTable).values({
                            userId: user.id,
                            stripeCustomerId: stripeCustomerId,
                        }),
                    );

                    if (insertMappingResult.error) {
                        console.error(
                            'DB Error inserting Stripe customer mapping:',
                            insertMappingResult.error,
                        );
                    }
                }
                // --- End Find or Create Stripe Customer ---

                console.log(
                    'createCheckoutSession - stripeCustomerId',
                    stripeCustomerId,
                );
                console.log('createCheckoutSession - priceId', priceId);
                console.log('createCheckoutSession - quantity', quantity);

                // --- Create Stripe Checkout Session ---
                try {
                    const createSessionResult =
                        await stripe.checkout.sessions.create({
                            mode: 'subscription',
                            line_items: [
                                {
                                    price: priceId,
                                    quantity: quantity,
                                },
                            ],
                            customer: stripeCustomerId,
                            success_url: successUrl,
                            cancel_url: cancelUrl,
                            payment_method_types: ['card'],
                        });

                    const output = {
                        sessionId: createSessionResult.id,
                        url: createSessionResult.url,
                    };

                    return Success(output);
                } catch (error) {
                    console.error(
                        'Stripe Error creating checkout session:',
                        error,
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create Stripe checkout session.',
                    });
                }
                // const createSessionResult = await catchError(
                //     stripe.checkout.sessions.create({
                //         mode: 'subscription',
                //         line_items: [
                //             {
                //                 price: priceId,
                //                 quantity: quantity,
                //             },
                //         ],
                //         // customer: stripeCustomerId,
                //         success_url: successUrl,
                //         cancel_url: cancelUrl,
                //     }),
                // );

                // console.log(
                //     'createCheckoutSession - createSessionResult',
                //     createSessionResult,
                // );

                // if (createSessionResult.error) {
                //     console.error(
                //         'Stripe Error creating checkout session:',
                //         createSessionResult.error,
                //     );
                //     throw new TRPCError({
                //         code: 'INTERNAL_SERVER_ERROR',
                //         message: 'Failed to create Stripe checkout session.',
                //     });
                // }
                // --- End Create Stripe Checkout Session ---
                // const output = {
                //     sessionId: createSessionResult.data.id,
                //     url: createSessionResult.data.url,
                // };

                // return Success(output);
            },
        ),
    );
