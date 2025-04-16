import { TRPCError } from '@trpc/server';

import { catchError } from '@errors/utils/catch-error.util';
import { stripe } from '@src/stripe/config/stripe';
import { createStripeCustomer } from './create-stripe-customer.utils';

/**
 * Fetches a Stripe customer for a user.
 * @param userId - The ID of the user to fetch a Stripe customer for.
 * @returns The Stripe customer object.
 */
export const getStripeCustomer = async (userId: string) => {
    const { data: customer, error: customerFetchError } = await catchError(
        stripe.customers.search({
            query: `metadata['userId']:'${userId}'`,
        }),
    );

    if (customerFetchError) {
        console.error('Stripe Error fetching customer:', customerFetchError);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch Stripe customer.',
        });
    }

    // if the customer is not found, create a new one
    if (customer.data.length === 0) {
        const newCustomer = await createStripeCustomer(userId);
        return newCustomer;
    }

    return customer.data[0];
};
