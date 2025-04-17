import { catchError } from '@errors/utils/catch-error.util';

import { createStripeSdk } from '@src/stripe/utils/create-stripe-sdk.util';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import Stripe from 'stripe';

/**
 * Creates a Stripe customer for a user.
 * @param email - The email of the user to create a Stripe customer for.
 * @param name - The name of the user to create a Stripe customer for.
 * @param metadata - The metadata to create a Stripe customer for.
 * @returns The Stripe customer object.
 */
export const createStripeCustomer = (async ({ email, name, metadata }) => {
    const { data: stripe, error: stripeCreateError } = await createStripeSdk();

    if (stripeCreateError) return Error();

    const { data: customer, error: customerCreateError } = await catchError(
        stripe.customers.create({
            email,
            name,
            metadata,
        }),
    );

    if (customerCreateError) return Error();

    return Success(customer);
}) satisfies Function<
    { email: string; name: string; metadata: Record<string, string> },
    Stripe.Response<Stripe.Customer>
>;
