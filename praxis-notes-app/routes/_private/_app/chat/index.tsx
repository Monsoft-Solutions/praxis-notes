import { z } from 'zod';

import { createFileRoute, Navigate } from '@tanstack/react-router';
// import { ChatView } from '@src/chat/views';

export const Route = createFileRoute('/_private/_app/chat/')({
    component: () => <Navigate to="/" />,

    validateSearch: z.object({
        sessionId: z.string().optional(),
    }),
});
