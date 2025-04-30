import { createFileRoute } from '@tanstack/react-router';

import { EditClientView } from '@src/client/views/private/edit-client.view';

export const Route = createFileRoute('/_private/_app/clients/$clientId/edit/')({
    component: EditClientView,
});
