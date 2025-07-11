import { createFileRoute } from '@tanstack/react-router';

import { ClientSessionsView } from '@src/client-session/views/private';

export const Route = createFileRoute(
    '/_private/_app/clients/$clientId/sessions/',
)({
    component: ClientSessionsView,
});
