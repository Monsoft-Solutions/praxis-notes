import { endpoints } from '@api/providers/server';

// queries
import { getChatSessions } from './get-chat-sessions.query';
import { getChatSession } from './get-chat-session.query';

// mutations
import { createChatSession } from './create-chat-session.mutation';
import { sendMessage } from './send-message.mutation';

// subscriptions
import { onChatMessageCreated } from './chat-message-created.subscription';
import { onChatSessionCreated } from './chat-session-created.subscription';
import { onChatSessionTitleUpdated } from './chat-session-title-updated.subscription';
import { onChatMessageUpdated } from './chat-message-updated.subscription';

// chat API router
export const chat = endpoints({
    getChatSessions,
    getChatSession,

    createChatSession,
    sendMessage,

    onChatMessageCreated,
    onChatSessionCreated,
    onChatSessionTitleUpdated,
    onChatMessageUpdated,
});
