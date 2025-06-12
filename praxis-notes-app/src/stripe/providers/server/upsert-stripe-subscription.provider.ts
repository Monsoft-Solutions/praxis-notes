import { v4 as uuidv4 } from 'uuid';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';

import { stripeSubscriptionsTable } from '../../db';
import type { StripeSubscriptionStatus } from '../../enums';

/**
 * Upserts a Stripe subscription record in the database
 * Creates a new record if it doesn't exist, updates if it does
 *
 * @param subscription - Subscription data to upsert
 * @returns Success() if upserted, Error otherwise
 */
export const upsertStripeSubscription = (async ({
    userId,
    stripeSubscriptionId,
    stripeCustomerId,
    stripePriceId,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
}: {
    userId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
}) => {
    const now = Date.now();

    // Map Stripe status to our enum
    let mappedStatus: StripeSubscriptionStatus;
    switch (status) {
        case 'active':
        case 'canceled':
        case 'incomplete':
        case 'incomplete_expired':
        case 'past_due':
        case 'trialing':
        case 'unpaid':
        case 'paused':
            mappedStatus = status;
            break;
        default:
            // Default to 'canceled' for any unknown status
            mappedStatus = 'canceled';
            console.warn(
                `Unknown subscription status: ${status}, defaulting to 'canceled'`,
            );
    }

    // Check if subscription already exists
    const { data: existingSubscription, error: findError } = await catchError(
        db.query.stripeSubscriptionsTable.findFirst({
            where: (record, { eq }) =>
                eq(record.stripeSubscriptionId, stripeSubscriptionId),
        }),
    );

    if (findError) {
        return Error('FIND_SUBSCRIPTION_ERROR');
    }

    if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await catchError(
            db
                .update(stripeSubscriptionsTable)
                .set({
                    userId,
                    stripeCustomerId,
                    stripePriceId,
                    status: mappedStatus,
                    currentPeriodStart,
                    currentPeriodEnd,
                    cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
                    updatedAt: now,
                })
                .where(
                    eq(
                        stripeSubscriptionsTable.stripeSubscriptionId,
                        stripeSubscriptionId,
                    ),
                ),
        );

        if (updateError) {
            return Error('UPDATE_SUBSCRIPTION_ERROR');
        }
    } else {
        // Create new subscription
        const { error: insertError } = await catchError(
            db.insert(stripeSubscriptionsTable).values({
                id: uuidv4(),
                userId,
                stripeSubscriptionId,
                stripeCustomerId,
                stripePriceId,
                status: mappedStatus,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: cancelAtPeriodEnd ?? false,
                createdAt: now,
                updatedAt: now,
            }),
        );

        if (insertError) {
            return Error('INSERT_SUBSCRIPTION_ERROR');
        }
    }

    return Success();
}) satisfies Function<{
    userId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
}>;
