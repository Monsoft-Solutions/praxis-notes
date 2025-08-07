import { useState } from 'react';
import { ChatWindow, ChatSessionsList } from '../components';
import { Menu, PlusCircle } from 'lucide-react';

import { api } from '@api/providers/web';

import { Route } from '@routes/_private/_app/chat';
import { ViewContainer } from '@shared/ui';
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
        <div className="relative h-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-orange-50">
            {/* Subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-16 top-32 h-10 w-10 rounded-full border-2 border-green-200 opacity-25"></div>
                <div className="absolute right-20 top-1/4 h-6 w-6 rounded border border-orange-100 opacity-30"></div>
                <div className="absolute bottom-40 left-1/4 h-3 w-3 rounded-full bg-blue-200 opacity-40"></div>
                <div className="absolute bottom-20 right-1/3 h-8 w-8 rounded border-2 border-yellow-200 opacity-20"></div>
            </div>

            <ViewContainer
                className="fle flex-col overflow-hidden p-0 pt-0"
                noPadding={true}
            >
                {/* Mobile sessions dialog */}
                <Dialog
                    open={isSessionsDialogOpen}
                    onOpenChange={setIsSessionsDialogOpen}
                >
                    <DialogContent
                        className="container max-w-[350px] rounded-3xl border-2 border-blue-200 p-0"
                        style={{
                            borderRadius: '25px 30px 20px 35px',
                        }}
                    >
                        <DialogHeader className="relative flex flex-row items-center justify-between border-b border-blue-200 px-4 py-3">
                            {/* Small thumb tack for dialog */}
                            <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 transform">
                                <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                                <div className="absolute left-1/2 top-1/2 h-0.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                            </div>
                            <DialogTitle className="font-quicksand pt-2 text-left text-base font-medium">
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
                <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-blue-200 bg-white/80 px-4 backdrop-blur-sm lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setIsSessionsDialogOpen(true);
                        }}
                        className="h-10 w-10 rounded-xl bg-blue-400 text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500"
                        style={{
                            borderRadius: '12px 14px 12px 16px',
                        }}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open chat sessions</span>
                    </Button>
                    <div className="font-quicksand text-shadow-sm font-bold text-gray-800">
                        Praxis Notes
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            void handleCreateSession();
                        }}
                        className="h-10 w-10 rounded-xl bg-green-400 text-white transition-all hover:-translate-y-0.5 hover:bg-green-500"
                        style={{
                            borderRadius: '12px 14px 12px 16px',
                        }}
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span className="sr-only">New chat</span>
                    </Button>
                </div>

                <div className="flex h-full flex-1 flex-col space-y-0 overflow-hidden lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:overflow-visible lg:p-4">
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
                        <div
                            className="relative flex h-[calc(100vh-11rem)] flex-col rounded-3xl border-2 border-green-200 bg-white shadow-lg lg:mt-0 lg:h-[calc(100vh-8.5rem)] lg:p-2"
                            style={{
                                borderRadius: '25px 30px 20px 35px',
                            }}
                        >
                            {/* Thumb tack for welcome card */}
                            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                                <div className="h-full w-full rounded-full bg-green-400 shadow-sm"></div>
                                <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                            </div>

                            <div className="flex h-full flex-col items-center justify-center p-6 pt-8 text-center">
                                <h3 className="font-quicksand text-shadow-sm text-2xl font-bold text-gray-800">
                                    Welcome to Chat
                                </h3>
                                <p className="font-nunito mt-2 text-gray-600">
                                    Select a chat session or create a new one to
                                    get started.
                                </p>
                                <Button
                                    onClick={() => {
                                        void handleCreateSession();
                                    }}
                                    className="font-quicksand mt-6 bg-orange-400 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-md"
                                    size="lg"
                                    style={{
                                        borderRadius: '12px 14px 12px 16px',
                                    }}
                                >
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    New Chat
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </ViewContainer>
        </div>
    );
}
