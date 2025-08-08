import { useState } from 'react';

import { PlusIcon, SearchIcon, MessageCircle } from 'lucide-react';

import { Button } from '@ui/button.ui';
import { Input } from '@ui/input.ui';

import { cn } from '@css/utils';

import { api } from '@api/providers/web/api.provider';
import { apiClientUtils } from '@api/providers/web';

type ChatSessionsListProps = {
    activeSessionId?: string;
    onSessionSelect: (sessionId: string) => void;
    onCreateSession: () => void;
};

export function ChatSessionsList({
    activeSessionId,
    onSessionSelect,
    onCreateSession,
}: ChatSessionsListProps) {
    const { data: chatSessionsQuery } = api.chat.getChatSessions.useQuery();

    const { setData: setChatSessions } = apiClientUtils.chat.getChatSessions;

    const sessions =
        chatSessionsQuery && !chatSessionsQuery.error
            ? chatSessionsQuery.data
            : undefined;

    api.chat.onChatSessionCreated.useSubscription(
        undefined,

        {
            onData: (newSession) => {
                if (!chatSessionsQuery || chatSessionsQuery.error) return;

                setChatSessions(undefined, (prevChatSessionsQuery) => {
                    if (!prevChatSessionsQuery || prevChatSessionsQuery.error)
                        return prevChatSessionsQuery;

                    const { data: prevSessions } = prevChatSessionsQuery;

                    const newSessionToAdd = {
                        ...newSession,
                        updatedAt: newSession.createdAt,
                    };

                    return {
                        error: null,
                        data: [
                            newSessionToAdd,
                            ...prevSessions.filter(
                                ({ id }) => id !== newSession.id,
                            ),
                        ],
                    };
                });
            },
        },
    );

    api.chat.onChatSessionTitleUpdated.useSubscription(
        undefined,

        {
            onData: (updatedSession) => {
                console.log('-->   ~ updatedSession:', updatedSession);

                if (!chatSessionsQuery || chatSessionsQuery.error) return;

                setChatSessions(undefined, (prevChatSessionsQuery) => {
                    if (!prevChatSessionsQuery || prevChatSessionsQuery.error)
                        return prevChatSessionsQuery;

                    const { data: prevSessions } = prevChatSessionsQuery;

                    return {
                        error: null,
                        data: prevSessions.map((session) =>
                            session.id === updatedSession.id
                                ? { ...session, title: updatedSession.title }
                                : session,
                        ),
                    };
                });
            },
        },
    );

    const [searchQuery, setSearchQuery] = useState('');

    if (!sessions) return;

    const filteredSessions = sessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="relative h-full">
            {/* Subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div
                    className="absolute left-4 top-8 h-8 w-8 rounded-full border-2 border-blue-200 opacity-20"
                    style={{ transform: 'rotate(0.1deg)' }}
                ></div>
                <div className="absolute bottom-16 right-6 h-2 w-2 rounded-full bg-orange-200 opacity-30"></div>
                <div className="absolute bottom-8 left-1/3 h-6 w-6 rounded border border-green-200 opacity-25"></div>
            </div>

            {/* Main sessions list card with thumb tack */}
            <div
                className="relative h-full overflow-hidden rounded-3xl"
                style={{
                    borderRadius: '25px 30px 20px 35px',
                }}
            >
                {/* Thumb tack - round style */}
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                    <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                    <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                </div>

                {/* Header section */}
                <div className="px-6 py-4 pt-6">
                    <h2 className="font-quicksand text-shadow-sm mb-4 text-lg font-bold text-gray-800">
                        Chat Sessions
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* Search field with hand-drawn styling */}
                        <div
                            className="relative flex-1 rounded-xl border-2 border-blue-200 bg-white transition-colors focus-within:border-blue-300"
                            style={{
                                borderRadius: '12px 14px 12px 16px',
                            }}
                        >
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                            <Input
                                placeholder="Search chats..."
                                className="font-nunito h-11 border-0 bg-transparent pl-10 pr-4 focus:ring-2 focus:ring-blue-300"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                            />
                        </div>

                        {/* New chat button */}
                        <Button
                            onClick={onCreateSession}
                            className="font-quicksand h-11 w-11 rounded-xl bg-green-400 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-500 hover:shadow-md"
                            style={{
                                borderRadius: '12px 14px 12px 16px',
                            }}
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span className="sr-only">New chat</span>
                        </Button>
                    </div>
                </div>

                {/* Separator */}
                <div className="mx-6 border-t border-blue-200"></div>

                {/* Sessions list */}
                <div className="flex-1 p-4">
                    <div className="max-h-[calc(100vh-19rem)] overflow-y-auto">
                        {filteredSessions.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                <MessageCircle className="mb-3 h-12 w-12 text-blue-300" />
                                <p className="font-nunito mb-3 text-sm text-gray-600">
                                    No chat sessions found
                                </p>
                                <Button
                                    onClick={onCreateSession}
                                    className="font-quicksand bg-orange-400 font-semibold text-white transition-all hover:bg-orange-500"
                                    style={{
                                        borderRadius: '12px 14px 12px 16px',
                                    }}
                                >
                                    Create new chat
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSessions.map((session, index) => {
                                    const isActive =
                                        activeSessionId === session.id;
                                    // Alternate colors for variety
                                    const colors = [
                                        {
                                            border: 'border-blue-200',
                                            bg: isActive
                                                ? 'bg-blue-50'
                                                : 'bg-white',
                                            accent: 'text-blue-600',
                                        },
                                        {
                                            border: 'border-green-200',
                                            bg: isActive
                                                ? 'bg-green-50'
                                                : 'bg-white',
                                            accent: 'text-green-600',
                                        },
                                        {
                                            border: 'border-orange-200',
                                            bg: isActive
                                                ? 'bg-orange-50'
                                                : 'bg-white',
                                            accent: 'text-orange-600',
                                        },
                                        {
                                            border: 'border-yellow-200',
                                            bg: isActive
                                                ? 'bg-yellow-50'
                                                : 'bg-white',
                                            accent: 'text-yellow-600',
                                        },
                                    ];
                                    const colorScheme = colors[index % 4];

                                    return (
                                        <div
                                            key={session.id}
                                            className="relative overflow-y-auto"
                                        >
                                            {/* Small thumb tack for each session card */}
                                            <div className="absolute -top-1 right-4 z-10 h-2 w-2 rotate-45 transform bg-gray-400 shadow-sm"></div>

                                            <button
                                                onClick={() => {
                                                    onSessionSelect(session.id);
                                                }}
                                                className={cn(
                                                    'w-full rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                                                    colorScheme.border,
                                                    colorScheme.bg,
                                                    isActive &&
                                                        'shadow-md ring-2 ring-blue-300 ring-opacity-50',
                                                )}
                                                style={{
                                                    borderRadius:
                                                        '15px 18px 14px 20px',
                                                }}
                                            >
                                                <div className="flex flex-col gap-1 pt-1">
                                                    <span
                                                        className={cn(
                                                            'font-quicksand truncate text-sm font-semibold',
                                                            isActive
                                                                ? colorScheme.accent
                                                                : 'text-gray-800',
                                                        )}
                                                    >
                                                        {session.title}
                                                    </span>
                                                    <span className="font-nunito text-xs text-gray-500">
                                                        {new Date(
                                                            session.updatedAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
