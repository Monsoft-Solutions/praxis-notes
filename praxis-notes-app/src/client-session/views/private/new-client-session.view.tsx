import { SessionForm } from '@src/client-session/components';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/new';

import { api } from '@api/providers/web';
import { ViewContainer } from '@shared/ui';

export function NewClientSessionView() {
    const { loggedInUser } = Route.useRouteContext();

    const { clientId } = Route.useParams();

    const { data: clientQuery } = api.client.getClient.useQuery({
        clientId,
    });

    const { data: placeholderSessionDataQuery } =
        api.clientSession.getPlaceholderSessionData.useQuery({
            clientId,
        });

    if (!clientQuery) return;
    if (clientQuery.error) return;
    const { data: client } = clientQuery;

    if (!placeholderSessionDataQuery) return;
    if (placeholderSessionDataQuery.error) return;
    const { data: placeholderSessionData } = placeholderSessionDataQuery;

    const clientName = client.firstName;

    return (
        <ViewContainer>
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-1 overflow-auto">
                    <SessionForm
                        isTour={!loggedInUser.hasDoneTour}
                        clientId={clientId}
                        clientName={clientName}
                        placeholderSessionData={{
                            ...placeholderSessionData,
                            sessionDate: new Date(
                                placeholderSessionData.sessionDate,
                            ),
                        }}
                    />
                </div>
            </div>
        </ViewContainer>
    );
}
