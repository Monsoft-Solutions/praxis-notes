import { protectedEndpoint, subscribe } from '@api/providers/server';

// subscription to notify when a chat session is created
export const onChatSessionTitleUpdated = protectedEndpoint.subscription(
    subscribe('chatSessionTitleUpdated', ({ data: session }) => {
        return session;
    }),
);
