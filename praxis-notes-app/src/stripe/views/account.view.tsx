import { ReactElement } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card.ui';

import { SubscriptionManagement } from '../components/subscription-management.component';
import { UserInformation } from '../components/user-information.component';
import { ViewContainer } from '@shared/ui';

export function AccountView(): ReactElement {
    return (
        <ViewContainer>
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
                        </CardHeader>
                        <CardContent className="pt-4">
                            <UserInformation />
                        </CardContent>
                    </Card>

                    <SubscriptionManagement />
                </div>
            </div>
        </ViewContainer>
    );
}
