import { SessionForm } from '@src/client-session/components';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/new';

export function NewClientSessionView() {
    const { clientId } = Route.useParams();

    const clientName = 'Client';

    return (
        <div className="container mx-auto py-6">
            <SessionForm clientId={clientId} clientName={clientName} />
        </div>
    );
}
