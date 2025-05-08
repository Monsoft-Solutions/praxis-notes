import { useState } from 'react';
import { ChatWindow, ChatSessionsList } from '../components';
import { Menu, PlusCircle } from 'lucide-react';

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
        <ViewContainer
            className="flex h-[calc(100vh-5rem)] flex-col overflow-hidden p-0 pt-0 sm:h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]"
            noPadding={true}
        >
            {/* Mobile sessions dialog */}
            <Dialog
                open={isSessionsDialogOpen}
                onOpenChange={setIsSessionsDialogOpen}
            >
                <DialogContent className="container max-w-[350px] p-0">
                    <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                        <DialogTitle className="text-left text-base font-medium">
                            Chat Sessions
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-auto">
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

            {/* Fixed header for mobile */}
            <div className="bg-background sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setIsSessionsDialogOpen(true);
                    }}
                    className="h-10 w-10"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open chat sessions</span>
                </Button>
                <div className="font-medium">Praxis Notes</div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        void handleCreateSession();
                    }}
                    className="h-10 w-10"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">New chat</span>
                </Button>
            </div>

            <div className="flex flex-1 flex-col space-y-0 overflow-hidden lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:overflow-visible lg:p-4">
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
                    <div className="flex h-full flex-col space-y-0">
                        <ChatWindow activeSessionId={sessionId} />
                    </div>
                ) : (
                    <Card className="lg:bg-card flex h-[calc(100vh-11rem)] flex-col border-none bg-transparent shadow-none lg:mt-0 lg:h-[calc(100vh-8.5rem)] lg:border lg:p-2 lg:shadow-sm">
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <h3 className="text-2xl font-medium">
                                Welcome to Chat
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                Select a chat session or create a new one to get
                                started.
                            </p>
                            <Button
                                onClick={() => {
                                    void handleCreateSession();
                                }}
                                className="mt-6"
                                size="lg"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                New Chat
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </ViewContainer>
    );
}
