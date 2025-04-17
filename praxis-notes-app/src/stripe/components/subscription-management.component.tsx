import { useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@shared/ui/button.ui';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

import { Spinner } from '@shared/ui/spinner.ui';
import { Badge } from '@shared/ui/badge.ui';

import { api } from '@api/providers/web';

type SubscriptionManagementProps = {
    className?: string;
};

export function SubscriptionManagement({
    className,
}: SubscriptionManagementProps) {
    const { data: subscriptionQuery } =
        api.stripe.getSubscriptionStatus.useQuery();

    const { mutateAsync: createPortalSession } =
        api.stripe.getCustomerPortalSession.useMutation();

    const [isLoading, setIsLoading] = useState(false);

    const handleManageSubscription = async () => {
        setIsLoading(true);

        // Create a customer portal session and redirect
        const portalSessionResponse = await createPortalSession();

        if (portalSessionResponse.error) {
            toast.error('Failed to create portal session');
            return;
        } else {
            const { url } = portalSessionResponse.data;

            // Redirect to Stripe customer portal
            if (url) window.open(url, '_blank');
        }

        setIsLoading(false);
    };

    if (!subscriptionQuery) {
        return (
            <Card className={className}>
                <CardContent className="flex h-40 items-center justify-center pt-6">
                    <Spinner />
                </CardContent>
            </Card>
        );
    }

    if (subscriptionQuery.error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Error Loading Subscription</CardTitle>
                    <CardDescription>
                        Unable to load subscription. Please try again later.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const { data: subscription } = subscriptionQuery;

    if (!subscription) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>No Active Subscription</CardTitle>
                    <CardDescription>
                        You don&apos;t have an active subscription.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Format currency amount from cents to dollars
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };

    const { features: featuresString } = subscription.plan.metadata;

    // Format features from pipe-separated string to array
    const features = featuresString ? featuresString.split('|') : [];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Your Subscription
                    <Badge
                        variant={
                            subscription.status === 'active'
                                ? 'default'
                                : 'outline'
                        }
                    >
                        {subscription.status === 'active'
                            ? 'Active'
                            : subscription.status === 'canceled'
                              ? 'Canceled'
                              : 'Inactive'}
                    </Badge>
                </CardTitle>

                <CardDescription>
                    Manage your subscription and billing details.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    <div className="bg-muted rounded-md p-3">
                        <h3 className="font-medium">
                            {subscription.plan.name}
                        </h3>

                        <div className="text-muted-foreground mt-1 text-sm">
                            {subscription.plan.amount && (
                                <div>
                                    {formatAmount(subscription.plan.amount)}
                                    {subscription.plan.interval &&
                                        `/${subscription.plan.interval}`}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {subscription.currentPeriodStart && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Current period started:
                                </span>

                                <span className="font-medium">
                                    {new Date(
                                        subscription.currentPeriodStart * 1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {subscription.currentPeriodEnd && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Next billing date:
                                </span>

                                <span className="font-medium">
                                    {new Date(
                                        subscription.currentPeriodEnd * 1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {subscription.cancelAtPeriodEnd !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Auto-renewal:
                                </span>

                                <span className="font-medium">
                                    {subscription.cancelAtPeriodEnd
                                        ? 'Off'
                                        : 'On'}
                                </span>
                            </div>
                        )}
                    </div>

                    {features.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-muted-foreground text-sm font-medium">
                                Plan includes:
                            </h3>

                            <ul className="list-inside list-disc space-y-1 text-sm">
                                {features.map((feature, index) => (
                                    <li key={index}>{feature.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={() => void handleManageSubscription()}
                    disabled={isLoading || subscription.status !== 'active'}
                    className="w-full"
                >
                    {isLoading ? <Spinner className="mr-2" /> : null}
                    Manage Subscription
                </Button>
            </CardFooter>
        </Card>
    );
}
