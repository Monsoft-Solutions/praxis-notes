import { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';

import { Button } from '@shared/ui/button.ui';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

export function PaymentCancelView(): ReactElement {
    return (
        <div className="container mx-auto flex justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-amber-100 p-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-8 w-8 text-amber-600"
                            >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl">
                        Payment Cancelled
                    </CardTitle>
                    <CardDescription className="text-center">
                        Your payment process was cancelled. No charges were
                        made.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p>
                        If you have any questions or concerns, please contact
                        our support team.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/pricing">Try Again</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
