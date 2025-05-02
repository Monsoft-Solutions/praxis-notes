import { useEffect, useMemo, useRef } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';
import { ChatMessageComponent } from './chat-message.component';
import { ChatInputComponent } from './chat-input.component';

import { api } from '@api/providers/web/api.provider';

import { apiClientUtils } from '@api/providers/web/api-client-utils.provider';
import { ScrollArea } from '@shared/ui/scroll-area.ui';

export function ChatWindow({ activeSessionId }: { activeSessionId: string }) {
    const { data: sessionQuery } = api.chat.getChatSession.useQuery({
        sessionId: activeSessionId,
    });

    const { setData: setSession } = apiClientUtils.chat.getChatSession;

    const { mutateAsync: sendMessage } = api.chat.sendMessage.useMutation();

    const handleSendMessage = async (message: string) => {
        await sendMessage({ sessionId: activeSessionId, content: message });
    };

    api.chat.onChatMessageCreated.useSubscription(
        {
            sessionId: activeSessionId,
        },

        {
            onData: (newMessage) => {
                if (!sessionQuery || sessionQuery.error) return;

                setSession(
                    { sessionId: activeSessionId },

                    (prevSessionQuery) => {
                        if (!prevSessionQuery || prevSessionQuery.error)
                            return prevSessionQuery;

                        const { data: prevSession } = prevSessionQuery;
                        const { messages: prevMessages } = prevSession;

                        return {
                            error: null,
                            data: {
                                ...prevSession,
                                messages: [
                                    ...prevMessages.filter(
                                        ({ id }) => id !== newMessage.id,
                                    ),
                                    newMessage,
                                ],
                            },
                        };
                    },
                );
            },
        },
    );

    api.chat.onChatMessageUpdated.useSubscription(
        {
            sessionId: activeSessionId,
        },

        {
            onData: (updatedMessage) => {
                if (!sessionQuery || sessionQuery.error) return;

                setSession(
                    { sessionId: activeSessionId },

                    (prevSessionQuery) => {
                        if (!prevSessionQuery || prevSessionQuery.error)
                            return prevSessionQuery;

                        const { data: prevSession } = prevSessionQuery;
                        const { messages: prevMessages } = prevSession;

                        return {
                            error: null,
                            data: {
                                ...prevSession,
                                messages: prevMessages.map((message) =>
                                    message.id === updatedMessage.id
                                        ? {
                                              ...message,
                                              content: updatedMessage.content,
                                          }
                                        : message,
                                ),
                            },
                        };
                    },
                );
            },
        },
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const session = useMemo(() => {
        if (!sessionQuery || sessionQuery.error) return undefined;
        return sessionQuery.data;
    }, [sessionQuery]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [session]);

    if (!session) return null;

    const { messages } = session;

    return (
        <Card className="flex h-[calc(100vh_-_10rem)] flex-col justify-between">
            <CardHeader className="flex-row items-center justify-between px-6 py-4">
                <CardTitle className="text-xl">{session.title}</CardTitle>
            </CardHeader>

            {/* <ScrollArea className="flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <p className="text-muted-foreground">
                                No messages yet. Start a conversation!
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col p-4">
                            {messages.map((message) => (
                                <ChatMessageComponent
                                    key={message.id}
                                    message={message}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea> */}

            <CardContent className="p-0">
                <ScrollArea className="flex h-[calc(100vh_-_25rem)] grow-0 flex-col">
                    <div className="">
                        {messages.map((message) => (
                            <ChatMessageComponent
                                key={message.id}
                                message={message}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="pt-0">
                <ChatInputComponent
                    onSend={(message) => {
                        void handleSendMessage(message);
                    }}
                    placeholder="Type a message..."
                />
            </CardFooter>
        </Card>
    );
}
