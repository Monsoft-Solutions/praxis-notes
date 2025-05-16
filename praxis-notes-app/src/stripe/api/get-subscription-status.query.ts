import { protectedEndpoint } from '@api/providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

import { db } from '@db/providers/server';

import { StripeSubscription, StripeSubscriptionStatus } from '../types';

import { createStripeSdk, getStripeCustomer } from '../utils';

import { eq } from 'drizzle-orm';

// Query to get the current user's subscription status
export const getSubscriptionStatus = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user: sessionUser },
            },
        }) => {
            const { data: stripe, error: stripeCreateError } =
                await createStripeSdk();

            if (stripeCreateError) return Error();

            const { data: userRecord, error: userError } = await catchError(
                db.query.user.findFirst({
                    where: ({ id }) => eq(id, sessionUser.id),
                }),
            );

            if (userError) return Error();

            if (!userRecord) return Success(null);

            const { email: userEmail } = userRecord;

            // Find the Stripe customer by email
            const { data: customersList, error: customersListError } =
                await catchError(
                    getStripeCustomer({
                        customerId: userRecord.id,
                        email: userEmail,
                        name: `${userRecord.name} ${userRecord.lastName}`,
                    }),
                );

            if (customersListError) return Error();

            const { data: stripeCustomer } = customersList;

            if (stripeCustomer === undefined) {
                // No customer found with this email
                return Success(null);
            }

            const { id: stripeCustomerId } = stripeCustomer;

            // Get the customer's subscriptions directly from Stripe
            const { data: subscriptionsList, error: subscriptionsListError } =
                await catchError(
                    stripe.subscriptions.list({
                        customer: stripeCustomerId,
                        status: 'all',
                        limit: 1,
                        expand: ['data.items'],
                    }),
                );

            if (subscriptionsListError) return Error();

            const { data: subscriptions } = subscriptionsList;

            const stripeSubscription = subscriptions.at(0);

            if (stripeSubscription === undefined) {
                // No subscriptions found for this customer
                return Success(null);
            }

            const { id: stripeSubscriptionId } = stripeSubscription;

            const {
                data: subscriptionItemsList,
                error: subscriptionItemsListError,
            } = await catchError(
                stripe.subscriptionItems.list({
                    subscription: stripeSubscriptionId,
                    limit: 1,
                }),
            );

            if (subscriptionItemsListError) return Error();

            const { data: subscriptionItems } = subscriptionItemsList;

            const subscriptionItem = subscriptionItems.at(0);

            if (subscriptionItem === undefined) {
                // No subscription items found for this customer
                return Success(null);
            }

            // Map Stripe subscription status to our application's SubscriptionStatus type
            let status: StripeSubscriptionStatus;

            const { status: subscriptionStatus } = stripeSubscription;

            switch (subscriptionStatus) {
                case 'active':
                case 'canceled':
                case 'incomplete':
                case 'incomplete_expired':
                case 'past_due':
                case 'trialing':
                case 'unpaid':
                    status = subscriptionStatus;
                    break;
                default:
                    // Map 'paused' or any other unknown status to 'canceled'
                    status = 'canceled';
            }

            // Get the price ID safely
            const priceId = subscriptionItem.price.id;

            // Construct the subscription object matching the expected type
            const output: StripeSubscription = {
                id: stripeSubscription.id,
                status,
                priceId,
                customerId: stripeCustomerId,
                currentPeriodStart: subscriptionItem.current_period_start
                    ? Number(subscriptionItem.current_period_start)
                    : undefined,
                currentPeriodEnd: subscriptionItem.current_period_end
                    ? Number(subscriptionItem.current_period_end)
                    : undefined,
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                plan: {
                    id: subscriptionItem.price.id,
                    name: subscriptionItem.price.nickname ?? '',
                    amount: subscriptionItem.price.unit_amount ?? 0,
                    interval: subscriptionItem.price.recurring?.interval ?? '',
                    metadata: subscriptionItem.price.metadata,
                },
            };

            return Success(output);
        },
    ),
);
