import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';

import { stripe } from '@src/stripe/config/stripe';
import { Success } from '@errors/utils';
import { connectionEnv } from '@env/constants/connection-env.constant';
import { getStripeCustomer } from '../utils';

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

                // get stripe customer. If the customer does not exist, create one
                const stripeCustomer = await getStripeCustomer(sessionUser.id);
                const stripeCustomerId = stripeCustomer.id;
                // --- Create Stripe Checkout Session ---
                try {
                    const {
                        data: createSessionResult,
                        error: createSessionError,
                    } = await catchError(
                        stripe.checkout.sessions.create({
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
                        }),
                    );

                    if (createSessionError) {
                        console.error(
                            'Stripe Error creating checkout session:',
                            createSessionError,
                        );
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message:
                                'Failed to create Stripe checkout session.',
                        });
                    }

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
            },
        ),
    );
