import { z } from 'zod';

export const stripeSubscriptionStatusEnum = z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused',
]);

export type StripeSubscriptionStatus = z.infer<
    typeof stripeSubscriptionStatusEnum
>;
