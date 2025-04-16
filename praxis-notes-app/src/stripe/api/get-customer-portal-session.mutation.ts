import { TRPCError } from '@trpc/server';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils';

import { stripe } from '@src/stripe/config/stripe';
import { connectionEnv } from '@env/constants/connection-env.constant';
import { getStripeCustomer } from '../utils';

export const getCustomerPortalSession = protectedEndpoint.mutation(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user: sessionUser },
            },
        }) => {
            const fqdn = connectionEnv.MSS_FQDN;
            if (!fqdn) {
                console.error('MSS_FQDN environment variable is not set.');
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Application FQDN is not configured.',
                });
            }
            const returnUrl = `${fqdn}/account`;

            const stripeCustomer = await getStripeCustomer(sessionUser.id);

            const stripeCustomerId = stripeCustomer.id;

            // --- Create Stripe Billing Portal Session ---
            const portalSessionResult = await catchError(
                stripe.billingPortal.sessions.create({
                    customer: stripeCustomerId,
                    return_url: returnUrl,
                }),
            );

            if (portalSessionResult.error) {
                console.error(
                    'Stripe Error creating billing portal session:',
                    portalSessionResult.error,
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create Stripe billing portal session.',
                });
            }
            // --- End Create Stripe Billing Portal Session ---

            return Success({ url: portalSessionResult.data.url });
        },
    ),
);
