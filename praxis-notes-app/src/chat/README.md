# Chat Module

The Chat Module provides AI-powered chat functionality enabling users to create chat sessions, send messages, and receive AI responses. It's designed to offer a ChatGPT-like experience integrated within the Praxis Notes application.

## Features

-   **Chat Sessions**: Create, update, delete and list chat sessions
-   **Real-time Messaging**: Send messages and receive AI-generated responses
-   **User Settings**: Customize AI model, temperature, and history preferences
-   **Context Support**: Add specific context to chat sessions for more targeted responses

## Technical Details

### Database

The module uses three primary tables:

-   `chat_session`: Stores chat conversation metadata (title, context, timestamps)
-   `chat_message`: Stores individual messages in chat sessions
-   `chat_settings`: Stores user preferences for AI interactions

### API Endpoints

#### Queries

-   `getChatSessions`: Retrieves all chat sessions belonging to the current user
-   `getChatSession`: Gets a specific chat session by ID
-   `getChatMessages`: Retrieves messages for a specific chat session

#### Mutations

-   `createChatSession`: Creates a new chat session
-   `updateChatSession`: Updates an existing chat session (title, context)
-   `deleteChatSession`: Deletes a chat session and all its messages
-   `sendMessage`: Sends a user message and generates an AI response
-   `updateChatSettings`: Updates user settings for AI interactions

#### Subscriptions

-   `onChatMessageCreated`: Real-time notification when a new message is created

### Events

-   `chatMessageCreated`: Emitted when a new message is created
-   `chatSessionCreated`: Emitted when a new chat session is created
-   `chatSettingsUpdated`: Emitted when a user's chat settings are updated

### Permission System

The module defines two roles:

-   `chat_user`: Regular user with access to their own chat sessions
-   `chat_admin`: Admin with full access to all chat sessions

## Usage Examples

### Creating a New Chat Session

```typescript
import { createChatSession } from '@src/chat/api';

const result = await createChatSession.mutate({
    title: 'Brainstorming Ideas',
    context: 'Help me think of creative solutions for workflow optimization',
});
```

### Sending a Message

```typescript
import { sendMessage } from '@src/chat/api';

const result = await sendMessage.mutate({
    sessionId: 'session-id-here',
    content: 'Can you help me understand the fundamentals of neural networks?',
});
```

### Subscribing to New Messages

```typescript
import { onChatMessageCreated } from '@src/chat/api';

onChatMessageCreated.subscribe({ sessionId: 'session-id-here' }, (message) => {
    console.log('New message:', message);
    // Update UI with new message
});
```

## Future Enhancements

-   Add support for streaming responses
-   Implement file attachment and image generation capabilities
-   Add chat history export functionality
-   Implement conversation summarization
-   Add support for custom AI instruction prompts
-   Integrate with existing notes to use them as context for conversations
