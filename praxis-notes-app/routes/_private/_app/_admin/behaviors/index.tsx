import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { BehaviorsView } from '@src/behavior/views/private/behaviors.view';

export const Route = createFileRoute('/_private/_app/_admin/behaviors/')({
    validateSearch: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        searchQuery: z.string().optional(),
    }),

    component: BehaviorsView,
});
