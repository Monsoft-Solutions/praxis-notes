import { createFileRoute } from '@tanstack/react-router';

import { ClientEditView } from '@src/client/views/private/client-edit.view';

export const Route = createFileRoute('/_private/_app/clients/$clientId/edit/')({
    component: ClientEditView,
});
