import { useState } from 'react';

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
    const [isLoading, setIsLoading] = useState(false);
    const { data: subscription, isLoading: isLoadingSubscription } =
        api.stripe.getSubscriptionStatus.useQuery();
    const { mutateAsync: createPortalSession } =
        api.stripe.getCustomerPortalSession.useMutation();

    const handleManageSubscription = async () => {
        try {
            setIsLoading(true);

            // Create a customer portal session and redirect
            const {
                data: { url },
            } = await createPortalSession();

            // Redirect to Stripe customer portal
            if (url) {
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Failed to create portal session', error);
            setIsLoading(false);
        }
    };

    if (isLoadingSubscription) {
        return (
            <Card className={className}>
                <CardContent className="flex h-40 items-center justify-center pt-6">
                    <Spinner />
                </CardContent>
            </Card>
        );
    }

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

    // Format features from pipe-separated string to array
    const features = subscription.data?.plan.metadata.features
        ? subscription.data.plan.metadata.features.split('|')
        : [];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Your Subscription
                    {subscription.data && (
                        <Badge
                            variant={
                                subscription.data.status === 'active'
                                    ? 'default'
                                    : 'outline'
                            }
                        >
                            {subscription.data.status === 'active'
                                ? 'Active'
                                : subscription.data.status === 'canceled'
                                  ? 'Canceled'
                                  : 'Inactive'}
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Manage your subscription and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subscription.data?.plan && (
                        <div className="bg-muted rounded-md p-3">
                            <h3 className="font-medium">
                                {subscription.data.plan.name}
                            </h3>
                            <div className="text-muted-foreground mt-1 text-sm">
                                {subscription.data.plan.amount && (
                                    <div>
                                        {formatAmount(
                                            subscription.data.plan.amount,
                                        )}
                                        {subscription.data.plan.interval &&
                                            `/${subscription.data.plan.interval}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {subscription.data?.currentPeriodStart && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Current period started:
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        subscription.data.currentPeriodStart *
                                            1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {subscription.data?.currentPeriodEnd && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Next billing date:
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        subscription.data.currentPeriodEnd *
                                            1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {subscription.data?.cancelAtPeriodEnd !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Auto-renewal:
                                </span>
                                <span className="font-medium">
                                    {subscription.data.cancelAtPeriodEnd
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
                    disabled={
                        isLoading || subscription.data?.status !== 'active'
                    }
                    className="w-full"
                >
                    {isLoading ? <Spinner className="mr-2" /> : null}
                    Manage Subscription
                </Button>
            </CardFooter>
        </Card>
    );
}
