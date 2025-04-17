import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { appUrl } from '@dist/constants';

import { getStripeCustomer } from '../utils';

import { createStripeSdk } from '../utils';

export const getCustomerPortalSession = protectedEndpoint.mutation(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            const { data: stripe, error: stripeCreateError } =
                await createStripeSdk();

            if (stripeCreateError) return Error();

            const returnUrl = `${appUrl}/account`;

            const { data: stripeCustomer, error: stripeCustomerError } =
                await getStripeCustomer({ customerId: user.id });

            if (stripeCustomerError) return Error();

            const stripeCustomerId = stripeCustomer.id;

            // create Stripe Billing Portal Session
            const { data: portalSession, error: portalSessionError } =
                await catchError(
                    stripe.billingPortal.sessions.create({
                        customer: stripeCustomerId,
                        return_url: returnUrl,
                    }),
                );

            if (portalSessionError) return Error();

            const { url } = portalSession;

            return Success({ url });
        },
    ),
);
