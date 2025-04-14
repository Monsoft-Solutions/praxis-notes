import { createFileRoute } from '@tanstack/react-router';

import { SessionNotesView } from '@src/notes/views/private';

export const Route = createFileRoute(
    '/_private/_app/clients/$clientId/sessions/$sessionId/notes/',
)({
    component: SessionNotesView,
});
