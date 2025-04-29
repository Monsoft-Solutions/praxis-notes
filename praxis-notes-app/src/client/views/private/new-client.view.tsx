import { Separator } from '@ui/separator.ui';
import { useEffect } from 'react';

import { ClientForm } from '../../components';
import { trackEvent } from '@analytics/providers';

export function NewClientView() {
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

            <ClientForm />
        </div>
    );
}
