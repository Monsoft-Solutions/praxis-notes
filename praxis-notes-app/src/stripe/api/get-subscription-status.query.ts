import { TRPCError } from '@trpc/server';

import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils';

import { db } from '@db/providers/server';
import { Subscription, SubscriptionStatus } from '../types';
import { authenticationTable } from '@db/db.tables';
import { stripe } from '../config/stripe';
import { eq } from 'drizzle-orm';

// Query to get the current user's subscription status
export const getSubscriptionStatus = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user: sessionUser },
            },
        }): Promise<{ data: Subscription | null; error: null }> => {
            const { data: userAuthentication, error: userAuthenticationError } =
                await catchError(
                    db
                        .select({
                            email: authenticationTable.email,
                        })
                        .from(authenticationTable)
                        .where(eq(authenticationTable.userId, sessionUser.id))
                        .limit(1),
                );

            if (userAuthenticationError || userAuthentication.length === 0) {
                return Success(null);
            }

            const { email: userEmail } = userAuthentication[0];

            try {
                // Find the Stripe customer by email
                const customerSearchResult = await catchError(
                    stripe.customers.list({
                        email: userEmail,
                        limit: 1,
                    }),
                );

                if (
                    customerSearchResult.error ||
                    customerSearchResult.data.data.length === 0
                ) {
                    // No customer found with this email
                    return Success(null);
                }

                const stripeCustomer = customerSearchResult.data.data[0];
                const stripeCustomerId = stripeCustomer.id;

                // Get the customer's subscriptions directly from Stripe
                const subscriptionListResult = await catchError(
                    stripe.subscriptions.list({
                        customer: stripeCustomerId,
                        status: 'all',
                        limit: 1,
                        expand: ['data.items'],
                    }),
                );

                if (
                    subscriptionListResult.error ||
                    subscriptionListResult.data.data.length === 0
                ) {
                    // No subscriptions found for this customer
                    return Success(null);
                }

                const stripeSubscription = subscriptionListResult.data.data[0];

                const subscriptionItems = await stripe.subscriptionItems.list({
                    subscription: stripeSubscription.id,
                    limit: 1,
                });

                const subscriptionItem = subscriptionItems.data[0];

                // Map Stripe subscription status to our application's SubscriptionStatus type
                let status: SubscriptionStatus;
                const subStatus = stripeSubscription.status;
                switch (subStatus) {
                    case 'active':
                    case 'canceled':
                    case 'incomplete':
                    case 'incomplete_expired':
                    case 'past_due':
                    case 'trialing':
                    case 'unpaid':
                        status = subStatus;
                        break;
                    default:
                        // Map 'paused' or any other unknown status to 'canceled'
                        status = 'canceled';
                }

                // Get the price ID safely
                const priceId = subscriptionItem.price.id;

                // Construct the subscription object matching the expected type
                const output: Subscription = {
                    id: stripeSubscription.id,
                    status,
                    priceId,
                    customerId: stripeCustomerId,
                    currentPeriodStart: stripeSubscription.start_date
                        ? Number(stripeSubscription.start_date)
                        : undefined,
                    currentPeriodEnd: stripeSubscription.ended_at
                        ? Number(stripeSubscription.ended_at)
                        : undefined,
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                    plan: {
                        id: subscriptionItem.price.id,
                        name: subscriptionItem.price.nickname ?? '',
                        amount: subscriptionItem.price.unit_amount ?? 0,
                        interval:
                            subscriptionItem.price.recurring?.interval ?? '',
                        metadata: subscriptionItem.price.metadata,
                    },
                };

                return Success(output);
            } catch (error) {
                console.error(
                    'Error fetching subscription status from Stripe:',
                    error,
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch subscription status from Stripe.',
                });
            }
        },
    ),
);
