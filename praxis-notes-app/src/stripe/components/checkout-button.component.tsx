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
    const { data: subscription, isLoading: isLoadingSubscription } =
        api.stripe.getSubscriptionStatus.useQuery();

    const { mutateAsync: createCheckoutSession } =
        api.stripe.createCheckoutSession.useMutation();

    const { mutateAsync: createPortalSession } =
        api.stripe.getCustomerPortalSession.useMutation();

    const handleCheckout = async () => {
        try {
            setIsLoading(true);

            // Create a checkout session and redirect to Stripe checkout
            const { data: { url } = { url: null } } =
                await createCheckoutSession({ priceId });

            // Redirect to Stripe checkout
            if (url) {
                window.location.href = url;
            }
        } catch {
            toast.error('Unable to start checkout process. Please try again.');
            setIsLoading(false);
        }
    };

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
        } catch {
            toast.error('Unable to manage subscription. Please try again.');
            setIsLoading(false);
        }
    };

    // If we're still checking subscription status, show loading state
    if (isLoadingSubscription) {
        return (
            <Button disabled className={className}>
                <Spinner className="mr-2" />
                Loading...
            </Button>
        );
    }

    // If user has an active subscription, show manage subscription button instead
    const hasActiveSubscription =
        subscription?.data &&
        (subscription.data.status === 'active' ||
            subscription.data.status === 'trialing');

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
