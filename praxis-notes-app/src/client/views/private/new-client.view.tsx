import { Separator } from '@ui/separator.ui';

import { ClientForm } from '../../components';

import { Route } from '@routes/_private/_app/clients/new';

export function NewClientView() {
    const { loggedInUser } = Route.useRouteContext();

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
