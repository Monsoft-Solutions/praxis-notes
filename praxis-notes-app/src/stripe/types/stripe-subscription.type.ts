import { StripeSubscriptionStatus } from './stripe-subscription-status.type';

export type StripeSubscription = {
    id: string;
    status: StripeSubscriptionStatus;
    priceId: string;
    customerId: string;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
    plan: {
        id: string;
        name: string;
        amount: number;
        interval: string;
        metadata: Record<string, string>;
    };
};
