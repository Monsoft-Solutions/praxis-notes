export type SubscriptionStatus =
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';

export type Subscription = {
    id: string;
    status: SubscriptionStatus;
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

export type CheckoutSession = {
    id: string;
    url: string;
};

export type CustomerPortalSession = {
    id: string;
    url: string;
};
