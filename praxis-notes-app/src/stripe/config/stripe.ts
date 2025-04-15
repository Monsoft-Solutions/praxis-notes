import Stripe from 'stripe';

import { stripeEnv } from '@env/constants/stripe-env.constant';

if (!stripeEnv.STRIPE_SECRET_KEY) {
    throw new Error(
        'Stripe secret key is not defined in environment variables.',
    );
}

// Initialize Stripe with the secret key
const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
    typescript: true,
});

export { stripe };
