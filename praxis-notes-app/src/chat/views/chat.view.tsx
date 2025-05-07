import { ChatWindow, ChatSessionsList } from '../components';

import { api } from '@api/providers/web';

import { Route } from '@routes/_private/_app/chat';
import { ViewContainer } from '@shared/ui';
import { Card } from '@shared/ui/card.ui';

export function ChatView() {
    const { sessionId } = Route.useSearch();

    const navigate = Route.useNavigate();

    const { mutateAsync: createChatSession } =
        api.chat.createChatSession.useMutation();

    const handleSetSessionId = async (sessionId: string) => {
        await navigate({ to: '/chat', search: { sessionId } });
    };

    const handleCreateSession = async () => {
        const result = await createChatSession();

        if (result.error) return;
        const {
            data: { sessionId },
        } = result;

        await navigate({ to: '/chat', search: { sessionId } });
    };

    return (
        <ViewContainer>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                <ChatSessionsList
                    activeSessionId={sessionId}
                    onSessionSelect={(sessionId) => {
                        void handleSetSessionId(sessionId);
                    }}
                    onCreateSession={() => {
                        void handleCreateSession();
                    }}
                />

                {sessionId ? (
                    <ChatWindow activeSessionId={sessionId} />
                ) : (
                    <Card className="flex h-[calc(100vh_-_10rem)] flex-col">
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <h3 className="text-2xl font-medium">
                                Welcome to Chat
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                Select a chat session or create a new one to get
                                started.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </ViewContainer>
    );
}
