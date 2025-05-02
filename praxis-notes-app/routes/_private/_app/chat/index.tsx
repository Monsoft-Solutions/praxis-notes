import { z } from 'zod';

import { createFileRoute } from '@tanstack/react-router';
import { ChatView } from '@src/chat/views';

export const Route = createFileRoute('/_private/_app/chat/')({
    component: ChatView,

    validateSearch: z.object({
        sessionId: z.string().optional(),
    }),
});
