import { protectedEndpoint, subscribe } from '@api/providers/server';

// subscription to notify when a chat session is created
export const onChatSessionCreated = protectedEndpoint.subscription(
    subscribe(
        'chatSessionCreated',
        ({
            ctx: {
                session: { user },
            },
            data: session,
        }) => {
            if (session.userId !== user.id) return;

            return session;
        },
    ),
);
