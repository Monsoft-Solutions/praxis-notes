import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { createStripeSdk } from '../../utils';
import { assignSubscriptionCredits } from './assign-subscription-credits.provider';
import { getOrCreateStripeCustomerRecord } from './get-or-create-stripe-customer-record.provider';

/**
 * Handles subscription renewal from invoice.paid events
 * This is specifically for recurring subscription payments
 *
 * @param invoiceId - The Stripe invoice ID
 * @param subscriptionId - The Stripe subscription ID
 * @param customerId - The Stripe customer ID
 * @returns Success() if renewal was processed, Error otherwise
 */
export const handleSubscriptionRenewal = (async ({
    invoiceId,
    subscriptionId,
    customerId,
}: {
    invoiceId: string;
    subscriptionId: string;
    customerId: string;
}) => {
    // Get Stripe SDK
    const { data: stripe, error: stripeError } = await createStripeSdk();

    if (stripeError) {
        return Error('STRIPE_SDK_ERROR');
    }

    // Get the subscription to find the price ID
    const { data: subscription, error: subscriptionError } = await catchError(
        stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
        }),
    );

    if (subscriptionError) {
        return Error('SUBSCRIPTION_RETRIEVE_ERROR');
    }

    // Get the price ID from the subscription
    const subscriptionItem = subscription.items.data[0];

    const stripePriceId = subscriptionItem.price.id;

    // Get user ID from customer
    const userIdResult = await getOrCreateStripeCustomerRecord({
        stripeCustomerId: customerId,
    });

    if (userIdResult.error) {
        return Error('CUSTOMER_RECORD_ERROR');
    }

    const { userId } = userIdResult.data;

    // Assign renewal credits
    const creditResult = await assignSubscriptionCredits({
        userId,
        stripePriceId,
        isNewSubscription: false, // This is a renewal
    });

    if (creditResult.error) {
        return Error('CREDIT_ASSIGNMENT_ERROR');
    }

    console.log(
        `Subscription renewal processed for invoice ${invoiceId}: User ${userId} received renewal credits for price ${stripePriceId}`,
    );

    return Success();
}) satisfies Function<{
    invoiceId: string;
    subscriptionId: string;
    customerId: string;
}>;
