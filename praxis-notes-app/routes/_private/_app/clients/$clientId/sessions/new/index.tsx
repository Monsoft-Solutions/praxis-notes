import { createFileRoute } from '@tanstack/react-router';

import { NewClientSessionView } from '@src/client-session/views/private';

export const Route = createFileRoute(
    '/_private/_app/clients/$clientId/sessions/new/',
)({
    component: NewClientSessionView,
});
