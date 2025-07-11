import { endpoints } from '@api/providers/server';

// queries
import { getChatSessions } from './get-chat-sessions.query';
import { getChatSession } from './get-chat-session.query';
import { getSuggestedQuestions } from './get-suggested-questions.query';

// mutations
import { createChatSession } from './create-chat-session.mutation';
import { sendMessageImproved as sendMessage } from './send-message-improved.mutation';

// subscriptions
import { onChatMessageCreated } from './chat-message-created.subscription';
import { onChatSessionCreated } from './chat-session-created.subscription';
import { onChatSessionTitleUpdated } from './chat-session-title-updated.subscription';
import { onChatMessageUpdated } from './chat-message-updated.subscription';
import { onSuggestedQuestionsGenerated } from './suggested-questions-generated.subscription';

// chat API router
export const chat = endpoints({
    getChatSessions,
    getChatSession,
    getSuggestedQuestions,

    createChatSession,
    sendMessage,

    onChatMessageCreated,
    onChatSessionCreated,
    onChatSessionTitleUpdated,
    onChatMessageUpdated,
    onSuggestedQuestionsCreated: onSuggestedQuestionsGenerated,
});
