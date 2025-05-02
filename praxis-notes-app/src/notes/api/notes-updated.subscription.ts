import { protectedEndpoint, subscribe } from '@api/providers/server';

import { z } from 'zod';

// subscription to notify when a chat message is updated
export const onNotesUpdated = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .subscription(
        subscribe('sessionNotesUpdated', ({ input: { sessionId }, data }) => {
            // only send events for the requested session
            if (data.sessionId !== sessionId) return;

            return data.notes;
        }),
    );
