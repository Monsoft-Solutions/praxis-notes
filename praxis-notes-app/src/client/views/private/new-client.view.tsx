import { Separator } from '@ui/separator.ui';
import { useEffect } from 'react';

import { ClientForm } from '../../components';
import { trackEvent } from '@analytics/providers';

import { Route } from '@routes/_private/_app/clients/new';

export function NewClientView() {
    const { loggedInUser } = Route.useRouteContext();

    useEffect(() => {
        trackEvent('client', 'client_create_view');
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="mt-2 text-3xl font-bold">Add New Client</h1>

                <p className="text-muted-foreground mt-1">
                    Create a new client record with behaviors, replacement
                    programs, and interventions.
                </p>
            </div>

            <Separator />

            <ClientForm isTour={!loggedInUser.hasDoneTour} />
        </div>
    );
}
