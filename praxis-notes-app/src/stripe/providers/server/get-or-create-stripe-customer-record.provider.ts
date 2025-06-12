import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import { createStripeSdk } from '../../utils';

/**
 * Gets the user ID associated with a Stripe customer ID
 * Uses the metadata stored in Stripe customer object
 *
 * @param stripeCustomerId - The Stripe customer ID
 * @returns The user ID associated with the customer
 */
export const getOrCreateStripeCustomerRecord = (async ({
    stripeCustomerId,
}: {
    stripeCustomerId: string;
}) => {
    // Get Stripe SDK
    const { data: stripe, error: stripeError } = await createStripeSdk();

    if (stripeError) {
        return Error('STRIPE_SDK_ERROR');
    }

    // Retrieve customer from Stripe
    const { data: customer, error: customerError } = await catchError(
        stripe.customers.retrieve(stripeCustomerId),
    );

    if (customerError) {
        return Error('STRIPE_CUSTOMER_RETRIEVE_ERROR');
    }

    // Check if customer is deleted
    if (customer.deleted) {
        return Error('STRIPE_CUSTOMER_DELETED');
    }

    // Get user ID from customer metadata
    const userId = customer.metadata.customerId || customer.metadata.userId;

    if (!userId) {
        // Log error - customer doesn't have user ID in metadata
        console.error(
            'Stripe customer missing user ID in metadata:',
            stripeCustomerId,
        );
        return Error('MISSING_USER_ID_IN_METADATA');
    }

    // Verify user exists in database
    const { data: userRecord, error: userError } = await catchError(
        db.query.user.findFirst({
            where: (record, { eq }) => eq(record.id, userId),
        }),
    );

    if (userError || !userRecord) {
        return Error('USER_NOT_FOUND');
    }

    return Success({ userId });
}) satisfies Function<{ stripeCustomerId: string }, { userId: string }>;
