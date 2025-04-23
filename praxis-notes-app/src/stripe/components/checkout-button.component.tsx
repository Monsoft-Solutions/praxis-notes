import { useState } from 'react';

import { Button } from '@shared/ui/button.ui';
import { Spinner } from '@shared/ui/spinner.ui';

import { api } from '@api/providers/web';
import { toast } from 'sonner';

type CheckoutButtonProps = {
    priceId: string;
    buttonText?: string;
    className?: string;
};

export function CheckoutButton({
    priceId,
    buttonText = 'Subscribe',
    className,
}: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Check if user already has a subscription
    const { data: subscriptionQuery } =
        api.stripe.getSubscriptionStatus.useQuery();

    const { mutateAsync: createCheckoutSession } =
        api.stripe.createCheckoutSession.useMutation();

    const { mutateAsync: createPortalSession } =
        api.stripe.getCustomerPortalSession.useMutation();

    const handleCheckout = async () => {
        setIsLoading(true);

        // Create a checkout session and redirect to Stripe checkout
        const checkoutSessionResult = await createCheckoutSession({
            priceId,
            quantity: 1,
        });

        if (checkoutSessionResult.error) {
            toast.error('Unable to start checkout process. Please try again.');
        } else {
            const { url } = checkoutSessionResult.data;

            if (url) window.open(url, '_blank');
        }

        setIsLoading(false);
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);

        // Create a customer portal session and redirect
        const portalSessionResult = await createPortalSession();

        if (portalSessionResult.error) {
            toast.error('Unable to manage subscription. Please try again.');
        } else {
            const { url } = portalSessionResult.data;

            // Redirect to Stripe customer portal
            window.open(url, '_blank');
        }

        setIsLoading(false);
    };

    // If we're still checking subscription status, show loading state
    if (!subscriptionQuery) {
        return (
            <Button disabled className={className}>
                <Spinner className="mr-2" />
                Loading...
            </Button>
        );
    }

    if (subscriptionQuery.error) {
        toast.error('Error checking subscription status. Please try again.');
        return;
    }

    const { data: subscription } = subscriptionQuery;

    // If user has an active subscription, show manage subscription button instead
    const hasActiveSubscription =
        subscription &&
        (subscription.status === 'active' ||
            subscription.status === 'trialing');

    return (
        <Button
            onClick={() =>
                void (hasActiveSubscription
                    ? handleManageSubscription()
                    : handleCheckout())
            }
            disabled={isLoading}
            className={className}
        >
            {isLoading ? <Spinner className="mr-2" /> : null}
            {hasActiveSubscription ? 'Manage Subscription' : buttonText}
        </Button>
    );
}
