import { z } from 'zod';

import { createFileRoute } from '@tanstack/react-router';

import { ClientSessionDetailsView } from '@src/client-session/views/private';

export const Route = createFileRoute(
    '/_private/_app/clients/$clientId/sessions/$sessionId/',
)({
    validateSearch: z.object({
        isGenerating: z.boolean().optional(),
        isEdit: z.boolean().optional(),
    }),

    component: ClientSessionDetailsView,
});
