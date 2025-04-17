import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { BehaviorsView } from '@src/behavior/views/private/behaviors.view';

export const Route = createFileRoute('/_private/_app/_admin/behaviors/')({
    validateSearch: z.object({
        searchQuery: z.string().optional(),
    }),

    component: BehaviorsView,
});
