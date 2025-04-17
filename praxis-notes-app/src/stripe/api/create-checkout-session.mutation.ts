import { z } from 'zod';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';

import { Success, Error } from '@errors/utils';
import { getStripeCustomer } from '../utils';

import { appUrl } from '@dist/constants';

import { createStripeSdk } from '../utils';

export const createCheckoutSession = protectedEndpoint
    .input(
        z.object({
            priceId: z.string(),
            quantity: z.number(),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { priceId, quantity },
            }) => {
                const { data: stripe, error: stripeCreateError } =
                    await createStripeSdk();

                if (stripeCreateError) return Error();

                const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${appUrl}/payment/cancel`;

                // get stripe customer. If the customer does not exist, create one
                const { data: stripeCustomer, error: stripeCustomerError } =
                    await getStripeCustomer({ customerId: user.id });

                if (stripeCustomerError) return Error();

                const stripeCustomerId = stripeCustomer.id;

                // create Stripe Checkout Session
                const { data: checkoutSession, error: createSessionError } =
                    await catchError(
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

                if (createSessionError) return Error();

                const { id, url } = checkoutSession;

                return Success({ id, url });
            },
        ),
    );
