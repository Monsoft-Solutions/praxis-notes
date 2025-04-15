import { useState } from 'react';

import { Button } from '@shared/ui/button.ui';
import { Spinner } from '@shared/ui/spinner.ui';

import { api } from '@api/providers/web';

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
    const { mutateAsync: createCheckoutSession } =
        api.stripe.createCheckoutSession.useMutation();

    const handleCheckout = async () => {
        try {
            setIsLoading(true);

            // Create a checkout session and redirect to Stripe checkout
            const {
                data: { url },
            } = await createCheckoutSession({ priceId });

            // Redirect to Stripe checkout
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to create checkout session', error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={() => void handleCheckout()}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? <Spinner className="mr-2" /> : null}
            {buttonText}
        </Button>
    );
}
