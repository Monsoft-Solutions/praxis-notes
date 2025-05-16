import { ReactElement } from 'react';

import { SubscriptionManagement } from '../components/subscription-management.component';
import { UserInformation } from '../components/user-information.component';
import { UserCredits } from '../components/user-credits.component';
import { ViewContainer } from '@shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs.ui';

export function AccountView(): ReactElement {
    return (
        <ViewContainer>
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold">Account</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and subscription
                    </p>
                </div>

                <div className="rounded-xl p-6">
                    <Tabs defaultValue="profile">
                        <TabsList className="mb-6 justify-start space-x-2 rounded-full border bg-gray-100 p-1.5">
                            <TabsTrigger
                                value="profile"
                                className="rounded-full px-5 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="credits"
                                className="rounded-full px-5 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Credits
                            </TabsTrigger>
                            <TabsTrigger
                                value="subscription"
                                className="rounded-full px-5 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Subscription
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-0">
                            <UserInformation />
                        </TabsContent>

                        <TabsContent value="credits" className="mt-0">
                            <UserCredits />
                        </TabsContent>

                        <TabsContent value="subscription" className="mt-0">
                            <SubscriptionManagement />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ViewContainer>
    );
}
