import { ReactElement, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import { Button } from '@shared/ui/button.ui';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

export function PaymentSuccessView(): ReactElement {
    const navigate = useNavigate();

    // Redirect to dashboard after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            void navigate({ to: '/dashboard' });
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div className="container mx-auto flex justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-green-600"
                                aria-label="Success Checkmark"
                                role="img"
                            >
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl">
                        Payment Successful!
                    </CardTitle>
                    <CardDescription className="text-center">
                        Thank you for your subscription. Your account has been
                        updated.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p>
                        You will be redirected to your dashboard in a few
                        seconds.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild>
                        <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
