import { catchError } from '@errors/utils/catch-error.util';

import { createStripeSdk } from './create-stripe-sdk.util';

import { createStripeCustomer } from './create-stripe-customer.utils';
import { Error, Success } from '@errors/utils';

import { Function } from '@errors/types';
import Stripe from 'stripe';
import { db } from '@db/providers/server';
import { user } from '@auth/db/auth.table';
import { eq } from 'drizzle-orm';

/**
 * Fetches a Stripe customer for a user.
 * @param userId - The ID of the user to fetch a Stripe customer for.
 * @returns The Stripe customer object.
 */
export const getStripeCustomer = (async ({ customerId, email, name }) => {
    const { data: stripe, error: stripeCreateError } = await createStripeSdk();

    if (stripeCreateError) return Error();

    // First check if user already has a stripe customer ID in database
    const { data: userRecord, error: userError } = await catchError(
        db.query.user.findFirst({
            where: ({ id }) => eq(id, customerId),
        }),
    );

    if (!userError && userRecord?.stripeCustomerId) {
        // User already has a stripe customer ID, retrieve it
        const { data: existingCustomer, error: existingCustomerError } =
            await catchError(
                stripe.customers.retrieve(userRecord.stripeCustomerId),
            );

        if (!existingCustomerError) {
            // Check if customer is deleted (Stripe returns deleted customers with a deleted flag)
            if ('deleted' in existingCustomer && existingCustomer.deleted) {
                // Customer was deleted, continue to search/create
            } else {
                return Success(existingCustomer as Stripe.Customer);
            }
        }
        // If retrieval failed or customer was deleted, continue to search/create
    }

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
                email,
                name,
                metadata: { customerId },
            });

        if (newCustomerCreateError) return Error();

        // Update user table with the new stripe customer ID
        await catchError(
            db
                .update(user)
                .set({ stripeCustomerId: newCustomer.id })
                .where(eq(user.id, customerId)),
        );

        return Success(newCustomer);
    }

    // If we found a customer but user doesn't have it stored, update the user table
    if (!userError && userRecord && !userRecord.stripeCustomerId) {
        await catchError(
            db
                .update(user)
                .set({ stripeCustomerId: customer.id })
                .where(eq(user.id, customerId)),
        );
    }

    return Success(customer);
}) satisfies Function<
    { customerId: string; email: string; name: string },
    Stripe.Customer
>;
