import { endpoints } from '@api/providers/server';

// queries
import { getProductsAndPrices } from './get-products-and-prices.query';
import { getSubscriptionStatus } from './get-subscription-status.query';

// mutations
import { getCustomerPortalSession } from './get-customer-portal-session.mutation';
import { createCheckoutSession } from './create-checkout-session.mutation';
// subscriptions

export const stripe = endpoints({
    // queries
    getProductsAndPrices,
    getSubscriptionStatus,

    // mutations
    createCheckoutSession,
    getCustomerPortalSession,

    // subscriptions
});
