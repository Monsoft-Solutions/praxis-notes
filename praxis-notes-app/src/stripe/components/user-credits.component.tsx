'use client';

import { ReactElement } from 'react';
import { Progress } from '../../../shared/ui/progress.ui';
import { api } from '@api/providers/web';
import { userCreditsMax } from '../../../bases/credits/user/constants/user-credits-max.constant';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card.ui';
import { CreditCard } from 'lucide-react';
import { cn } from '@css/utils';

export function UserCredits(): ReactElement {
    const { data: userCreditsQuery } =
        api.stripe.getUserCreditsQuery.useQuery();

    if (!userCreditsQuery) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 rounded-full p-1.5">
                            <CreditCard className="text-primary h-4 w-4" />
                        </div>
                        Credits Usage
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">Loading credits...</p>
                </CardContent>
            </Card>
        );
    }

    const { credits } = userCreditsQuery.data;

    if (!credits) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 rounded-full p-1.5">
                            <CreditCard className="text-primary h-4 w-4" />
                        </div>
                        Credits Usage
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">
                        No credits information available
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Get the first credit type (assuming generateNotes is the main one we care about)
    const creditType = 'generateNotes';
    const usedCredits = userCreditsMax[creditType] - (credits[creditType] || 0);
    const totalCredits = userCreditsMax[creditType];
    const percentUsed = (usedCredits / totalCredits) * 100;
    const percentRemaining = 100 - percentUsed;
    const remaining = totalCredits - usedCredits;

    // Determine the color based on remaining credits percentage
    const getColorClass = () => {
        if (percentRemaining > 75) return 'text-green-500';
        if (percentRemaining > 25) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-primary/10 rounded-full p-1.5">
                        <CreditCard className="text-primary h-4 w-4" />
                    </div>
                    Credits Usage
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-6">
                    {/* Circular progress visualization */}
                    <div className="relative mx-auto flex items-center justify-center">
                        <svg
                            className="h-32 w-32 -rotate-90 transform"
                            viewBox="0 0 100 100"
                        >
                            {/* Background circle */}
                            <circle
                                className="text-muted/25"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                            />
                            {/* Progress circle */}
                            <circle
                                className={cn(
                                    'transition-all duration-500 ease-in-out',
                                    getColorClass(),
                                )}
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 * (percentUsed / 100)}
                            />
                        </svg>

                        {/* Center content */}
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold">
                                {remaining}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                remaining
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">
                                Usage
                            </span>
                            <span className="text-sm font-medium">
                                {usedCredits} of {totalCredits} used
                            </span>
                        </div>
                        <Progress
                            value={percentRemaining}
                            className={cn(
                                'h-2',
                                percentRemaining > 75
                                    ? 'bg-muted'
                                    : percentRemaining > 25
                                      ? 'bg-amber-100'
                                      : 'bg-red-100',
                            )}
                        />
                        <div className="text-muted-foreground pt-1 text-center text-xs">
                            {remaining} credits remaining for generating notes
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
