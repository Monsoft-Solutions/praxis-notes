import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils';

import { stripe } from '@src/stripe/config/stripe';
import { db } from '@db/providers/server';
import { stripeCustomerTable } from '../db';
import { connectionEnv } from '@env/constants/connection-env.constant';

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

            // --- Get Stripe Customer ID ---
            const customerMappingResult = await catchError(
                db
                    .select({
                        stripeCustomerId: stripeCustomerTable.stripeCustomerId,
                    })
                    .from(stripeCustomerTable)
                    .where(eq(stripeCustomerTable.userId, sessionUser.id))
                    .limit(1),
            );

            if (
                customerMappingResult.error ||
                customerMappingResult.data.length === 0
            ) {
                console.error(
                    'DB Error or no Stripe customer mapping found for user:',
                    sessionUser.id,
                    customerMappingResult.error,
                );
                // If no customer ID, they likely haven't subscribed yet.
                // Throwing an error might be appropriate.
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Stripe customer record not found for this user.',
                });
            }
            const stripeCustomerId =
                customerMappingResult.data[0].stripeCustomerId;
            // --- End Get Stripe Customer ID ---

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
