import { protectedEndpoint, subscribe } from '@api/providers/server';

import { z } from 'zod';

// subscription to notify when a chat message is updated
export const onChatMessageUpdated = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .subscription(
        subscribe(
            'chatMessageUpdated',
            ({ input: { sessionId }, data: message }) => {
                // only send events for the requested session
                if (message.sessionId !== sessionId) return;

                return message;
            },
        ),
    );
