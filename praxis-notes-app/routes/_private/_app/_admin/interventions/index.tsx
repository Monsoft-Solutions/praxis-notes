import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { InterventionsView } from '@src/intervention/views/private';

export const Route = createFileRoute('/_private/_app/_admin/interventions/')({
    validateSearch: z.object({
        searchQuery: z.string().optional(),
    }),

    component: InterventionsView,
});
