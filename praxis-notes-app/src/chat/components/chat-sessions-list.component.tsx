import { useState } from 'react';

import { PlusIcon, SearchIcon } from 'lucide-react';

import { Button } from '@ui/button.ui';
import { Card, CardContent, CardHeader } from '@ui/card.ui';
import { Separator } from '@ui/separator.ui';
import { Input } from '@ui/input.ui';
import { ScrollArea } from '@ui/scroll-area.ui';

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
        <Card className="flex h-full flex-col p-0">
            <CardHeader className="px-4 py-2">
                <div className="mt-2 flex items-center justify-between">
                    <div className="relative flex items-center">
                        <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />

                        <Input
                            placeholder="Search chats..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                        />
                    </div>

                    <Button
                        onClick={onCreateSession}
                        size="icon"
                        variant="outline"
                        className="bg-primary text-primary-foreground h-8 w-8 rounded-full"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span className="sr-only">New chat</span>
                    </Button>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[60vh] max-h-[60vh] lg:h-[calc(100vh-12rem)] lg:max-h-none">
                    {filteredSessions.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                            <p className="text-muted-foreground text-sm">
                                No chat sessions found
                            </p>
                            <Button
                                onClick={onCreateSession}
                                variant="ghost"
                                className="mt-2"
                                size="sm"
                            >
                                Create new chat
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-1 p-2">
                            {filteredSessions.map((session) => (
                                <li key={session.id}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'w-full justify-start text-left text-sm',
                                            activeSessionId === session.id &&
                                                'bg-accent',
                                        )}
                                        onClick={() => {
                                            onSessionSelect(session.id);
                                        }}
                                    >
                                        <div className="flex w-full flex-col overflow-hidden">
                                            <span className="truncate text-xs">
                                                {session.title}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {new Date(
                                                    session.updatedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
