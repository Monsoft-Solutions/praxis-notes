import { SessionForm } from '@src/client-session/components';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/new';

import { api } from '@api/providers/web';

export function NewClientSessionView() {
    const { clientId } = Route.useParams();

    const { data: clientQuery } = api.client.getClient.useQuery({
        clientId,
    });

    if (!clientQuery) return;
    if (clientQuery.error) return;
    const { data: client } = clientQuery;

    const clientName = client.firstName;

    return (
        <div className="container mx-auto px-0 py-6">
            <SessionForm clientId={clientId} clientName={clientName} />
        </div>
    );
}
