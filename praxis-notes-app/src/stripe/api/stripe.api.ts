import { endpoints } from '@api/providers/server';

// queries
import { getProductsAndPrices } from './get-products-and-prices.query';
import { getSubscriptionStatus } from './get-subscription-status.query';
import { getUserCreditsQuery } from './get-user-credits.query';
import { getCreditHistory } from './get-credit-history.query';
import { listStripeSubscriptionCredits } from './list-stripe-subscription-credits.query';

// mutations
import { getCustomerPortalSession } from './get-customer-portal-session.mutation';
import { createCheckoutSession } from './create-checkout-session.mutation';
import { createStripeSubscriptionCredits } from './create-stripe-subscription-credits.mutation';
import { updateStripeSubscriptionCredits } from './update-stripe-subscription-credits.mutation';
import { stripeWebhook } from './stripe.webhook';

// subscriptions

export const stripe = endpoints({
    // queries
    getProductsAndPrices,
    getSubscriptionStatus,
    getUserCreditsQuery,
    getCreditHistory,
    listStripeSubscriptionCredits,

    // mutations
    createCheckoutSession,
    getCustomerPortalSession,
    createStripeSubscriptionCredits,
    updateStripeSubscriptionCredits,

    // subscriptions
    stripeWebhook,
});
