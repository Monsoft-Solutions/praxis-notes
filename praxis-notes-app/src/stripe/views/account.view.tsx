import { ReactElement } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

import { SubscriptionManagement } from '../components/subscription-management.component';

export function AccountView(): ReactElement {
    return (
        <div className="container mx-auto py-12">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">Account</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and subscription
                    </p>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Your personal account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* This would typically include other account settings */}
                            <p>
                                This section could include account information
                                like name, email, etc.
                            </p>
                        </CardContent>
                    </Card>

                    <SubscriptionManagement />
                </div>
            </div>
        </div>
    );
}
