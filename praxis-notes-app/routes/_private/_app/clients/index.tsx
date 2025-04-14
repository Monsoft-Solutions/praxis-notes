import { createFileRoute } from '@tanstack/react-router';

import { ClientsView } from '@src/client/views/private/clients.view';

export const Route = createFileRoute('/_private/_app/clients/')({
    component: ClientsView,
});
