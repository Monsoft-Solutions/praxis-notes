import { ReactElement, useState } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs.ui';

import { Badge } from '@shared/ui/badge.ui';

import { Spinner } from '@shared/ui/spinner.ui';

import { CheckoutButton } from '../components/checkout-button.component';

import { api } from '@api/providers/web';

import { SubscriptionManagement } from '../components/subscription-management.component';

import Stripe from 'stripe';

type BillingInterval = 'month' | 'year';

export function PricingView(): ReactElement {
    const [billingInterval, setBillingInterval] =
        useState<BillingInterval>('month');

    // Check if user already has a subscription
    const { data: subscriptionQuery } =
        api.stripe.getSubscriptionStatus.useQuery();

    // Fetch products and prices from the API
    const { data: productsAndPricesQuery } =
        api.stripe.getProductsAndPrices.useQuery();

    // Format currency for display
    const formatCurrency = (amount: number | null, currency: string) => {
        if (amount === null) return 'Custom';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
        }).format(amount / 100);
    };

    // Get the appropriate price for the current billing interval
    const getPriceForInterval = (
        prices: Stripe.Price[],
        interval: BillingInterval,
    ) => {
        const price = prices.find(
            (price) => price.recurring?.interval === interval && price.active,
        );

        return price;
    };

    if (!subscriptionQuery || !productsAndPricesQuery) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (subscriptionQuery.error || productsAndPricesQuery.error) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="mb-4 text-3xl font-bold">Pricing Plans</h1>
                <p className="text-muted-foreground mb-8 text-xl">
                    Unable to load pricing information. Please try again later.
                </p>
            </div>
        );
    }

    const { data: subscription } = subscriptionQuery;

    const { data: productsAndPrices } = productsAndPricesQuery;

    // Check if the user has an active subscription
    const hasActiveSubscription =
        subscription &&
        (subscription.status === 'active' ||
            subscription.status === 'trialing');

    // Filter active products with at least one price
    const products = productsAndPrices.products.filter((product) =>
        product.prices.some((price) => price.active),
    );

    return (
        <div className="container mx-auto py-12">
            {hasActiveSubscription && (
                <div className="mx-auto mb-16 max-w-2xl">
                    <div className="mb-8 text-center">
                        <h2 className="mb-4 text-2xl font-bold">
                            Your Current Subscription
                        </h2>
                    </div>
                    <SubscriptionManagement />
                </div>
            )}

            <div className="mb-12 text-center">
                <h1 className="mb-4 text-3xl font-bold">Pricing Plans</h1>
                <p className="text-muted-foreground mb-8 text-xl">
                    {hasActiveSubscription
                        ? 'Compare your current plan with other available options'
                        : 'Choose the perfect plan for your practice'}
                </p>

                <Tabs
                    defaultValue="month"
                    value={billingInterval}
                    onValueChange={(value) => {
                        setBillingInterval(value as BillingInterval);
                    }}
                    className="mx-auto w-fit"
                >
                    <TabsList>
                        <TabsTrigger value="month">Monthly</TabsTrigger>
                        <TabsTrigger value="year">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {products
                    .map((product) => {
                        const price = getPriceForInterval(
                            product.prices,
                            billingInterval,
                        );
                        return { product, price };
                    })
                    .filter(({ price }) => price !== undefined)
                    .sort(
                        (a, b) =>
                            (a.price?.unit_amount ?? 0) -
                            (b.price?.unit_amount ?? 0),
                    )
                    .map(({ product, price }) => {
                        if (!price) return null;

                        // Check if this is the user's current plan
                        const isCurrentPlan = Boolean(
                            hasActiveSubscription &&
                                subscription.priceId === price.id,
                        );

                        return (
                            <Card
                                key={product.id}
                                className={`flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{product.name}</CardTitle>
                                        {isCurrentPlan && (
                                            <Badge variant="default">
                                                Current Plan
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {product.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold">
                                            {formatCurrency(
                                                price.unit_amount,
                                                price.currency,
                                            )}
                                        </span>
                                        <span className="text-muted-foreground">
                                            /{billingInterval}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {price.metadata.features
                                            .split('|')
                                            .map((feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="mr-2 h-5 w-5 text-green-500"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <CheckoutButton
                                        priceId={price.id}
                                        buttonText={
                                            isCurrentPlan
                                                ? 'Current Plan'
                                                : 'Subscribe Now'
                                        }
                                        className="w-full"
                                    />
                                </CardFooter>
                            </Card>
                        );
                    })}
            </div>

            {/* Show a message if no products are available */}
            {products.length === 0 && (
                <div className="text-center">
                    <p className="text-muted-foreground text-xl">
                        No pricing plans are currently available. Please check
                        back later.
                    </p>
                </div>
            )}
        </div>
    );
}
