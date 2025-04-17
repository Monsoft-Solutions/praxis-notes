import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';

import { AntecedentsView } from '@src/antecedent/views/private';

export const Route = createFileRoute('/_private/_app/_admin/antecedents/')({
    validateSearch: z.object({
        searchQuery: z.string().optional(),
    }),

    component: AntecedentsView,
});
