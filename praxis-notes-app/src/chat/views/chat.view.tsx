import { useState } from 'react';
import { ChatWindow, ChatSessionsList } from '../components';
import { Menu } from 'lucide-react';

import { api } from '@api/providers/web';

import { Route } from '@routes/_private/_app/chat';
import { ViewContainer } from '@shared/ui';
import { Card } from '@shared/ui/card.ui';
import { Button } from '@shared/ui/button.ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@shared/ui/dialog.ui';

export function ChatView() {
    const { sessionId } = Route.useSearch();
    const [isSessionsDialogOpen, setIsSessionsDialogOpen] = useState(false);

    const navigate = Route.useNavigate();

    const { mutateAsync: createChatSession } =
        api.chat.createChatSession.useMutation();

    const handleSetSessionId = async (sessionId: string) => {
        await navigate({ to: '/chat', search: { sessionId } });
        setIsSessionsDialogOpen(false);
    };

    const handleCreateSession = async () => {
        const result = await createChatSession();

        if (result.error) return;
        const {
            data: { sessionId },
        } = result;

        await navigate({ to: '/chat', search: { sessionId } });
        setIsSessionsDialogOpen(false);
    };

    return (
        <ViewContainer>
            {/* Mobile sessions dialog */}
            <Dialog
                open={isSessionsDialogOpen}
                onOpenChange={setIsSessionsDialogOpen}
            >
                <DialogContent className="container max-w-[350px] p-0">
                    <DialogHeader className="flex flex-row items-center justify-between px-4 py-2">
                        <DialogTitle className="text-left">
                            Chat Sessions
                        </DialogTitle>
                        {/* <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                setIsSessionsDialogOpen(false);
                            }}
                        >
                            <X className="h-5 w-5" />
                        </Button> */}
                    </DialogHeader>
                    <div className="max-h-[70vh]">
                        <ChatSessionsList
                            activeSessionId={sessionId}
                            onSessionSelect={(sessionId) => {
                                void handleSetSessionId(sessionId);
                            }}
                            onCreateSession={() => {
                                void handleCreateSession();
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Mobile sessions button */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setIsSessionsDialogOpen(true);
                    }}
                    className="h-10 w-10"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open chat sessions</span>
                </Button>
                <h2 className="text-xl font-semibold">Chat</h2>
                <div className="w-10"></div> {/* For balance */}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                {/* Desktop sessions list - hidden on mobile */}
                <div className="hidden lg:block">
                    <ChatSessionsList
                        activeSessionId={sessionId}
                        onSessionSelect={(sessionId) => {
                            void handleSetSessionId(sessionId);
                        }}
                        onCreateSession={() => {
                            void handleCreateSession();
                        }}
                    />
                </div>

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
                            {/* Mobile-friendly create button */}
                            <Button
                                onClick={() => {
                                    void handleCreateSession();
                                }}
                                className="mt-4 lg:hidden"
                            >
                                Create New Session
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </ViewContainer>
    );
}
