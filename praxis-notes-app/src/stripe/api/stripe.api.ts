import { endpoints } from '@api/providers/server';

// queries
import { getProductsAndPrices } from './get-products-and-prices.query';
import { getSubscriptionStatus } from './get-subscription-status.query';

// mutations
import { getCustomerPortalSession } from './get-customer-portal-session.mutation';
import { createCheckoutSession } from './create-checkout-session.mutation';
import { getUserCreditsQuery } from './get-user-credits.query';
import { stripeWebhook } from './stripe.webhook';
// subscriptions

export const stripe = endpoints({
    // queries
    getProductsAndPrices,
    getSubscriptionStatus,
    getUserCreditsQuery,

    // mutations
    createCheckoutSession,
    getCustomerPortalSession,

    // subscriptions
    stripeWebhook,
});
