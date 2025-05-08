import { useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@ui/card.ui';
import { ChatMessageComponent } from './chat-message.component';
import { ChatInputComponent } from './chat-input.component';
import { ChatSuggestedQuestions } from './chat-suggested-questions.component';

import { api } from '@api/providers/web/api.provider';

import { apiClientUtils } from '@api/providers/web/api-client-utils.provider';
import { ScrollArea } from '@shared/ui/scroll-area.ui';

type ChatWindowProps = {
    activeSessionId: string;
};

export function ChatWindow({ activeSessionId }: ChatWindowProps) {
    const { data: sessionQuery } = api.chat.getChatSession.useQuery({
        sessionId: activeSessionId,
    });

    const { setData: setSession } = apiClientUtils.chat.getChatSession;

    const { mutateAsync: sendMessage } = api.chat.sendMessage.useMutation();

    const handleSendMessage = async (message: string) => {
        await sendMessage({ sessionId: activeSessionId, content: message });
    };

    const handleSuggestedQuestionSelect = async (question: string) => {
        await handleSendMessage(question);
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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [session]);

    if (!session) return null;

    const { messages } = session;

    return (
        <Card className="mt-0 flex h-full flex-col items-stretch justify-between space-y-0 border-none p-2 pt-0 shadow-none sm:border sm:shadow-inner lg:max-h-[calc(100vh-6rem)]">
            <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea className="h-[calc(100vh-11rem)] md:h-[calc(100vh-12rem)] lg:h-[calc(100vh-10rem)]">
                    <div className="h-32 w-full lg:h-20"></div>
                    <div className="py-4">
                        {messages.map((message) => (
                            <ChatMessageComponent
                                key={message.id}
                                message={message}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                        {messages.length === 0 && (
                            <div className="flex justify-start justify-self-end pt-10">
                                <ChatSuggestedQuestions
                                    sessionId={activeSessionId}
                                    onQuestionSelect={(question) => {
                                        void handleSuggestedQuestionSelect(
                                            question,
                                        );
                                    }}
                                    className="max-w-[90%]"
                                />
                            </div>
                        )}
                    </div>
                    <div className="h-2 w-full"></div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="bg-background sticky bottom-0 mt-auto flex flex-col items-stretch gap-2 border-t pb-3 pt-3 md:pb-4">
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
