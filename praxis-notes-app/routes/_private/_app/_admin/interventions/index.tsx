import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { InterventionsView } from '@src/intervention/views/private';

export const Route = createFileRoute('/_private/_app/_admin/interventions/')({
    validateSearch: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        searchQuery: z.string().optional(),
    }),

    component: InterventionsView,
});
