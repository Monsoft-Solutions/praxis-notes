import { z } from 'zod';

import { createFileRoute } from '@tanstack/react-router';

import { NewClientView } from '@src/client/views/private/new-client.view';

export const Route = createFileRoute('/_private/_app/clients/new/')({
    component: NewClientView,

    validateSearch: z.object({
        fromDraft: z.string().optional(),
    }),
});
