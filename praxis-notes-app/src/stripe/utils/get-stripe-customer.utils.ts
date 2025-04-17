import { catchError } from '@errors/utils/catch-error.util';

import { createStripeSdk } from './create-stripe-sdk.util';

import { createStripeCustomer } from './create-stripe-customer.utils';
import { Error, Success } from '@errors/utils';

import { Function } from '@errors/types';
import Stripe from 'stripe';

/**
 * Fetches a Stripe customer for a user.
 * @param userId - The ID of the user to fetch a Stripe customer for.
 * @returns The Stripe customer object.
 */
export const getStripeCustomer = (async ({ customerId }) => {
    const { data: stripe, error: stripeCreateError } = await createStripeSdk();

    if (stripeCreateError) return Error();

    const { data: matchingCustomers, error: matchingCustomersFetchError } =
        await catchError(
            stripe.customers.search({
                query: `metadata['customerId']:'${customerId}'`,
            }),
        );

    if (matchingCustomersFetchError) return Error();

    const customer = matchingCustomers.data.at(0);

    // if no matching customer found, create a new one
    if (customer === undefined) {
        const { data: newCustomer, error: newCustomerCreateError } =
            await createStripeCustomer({
                email: '',
                name: '',
                metadata: { customerId },
            });

        if (newCustomerCreateError) return Error();

        return Success(newCustomer);
    }

    return Success(customer);
}) satisfies Function<{ customerId: string }, Stripe.Customer>;
