import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardFooter } from '@ui/card.ui';
import { ChatMessageComponent } from './chat-message.component';
import { ChatInputComponent } from './chat-input.component';
import { ChatSuggestedQuestions } from './chat-suggested-questions.component';

import { api } from '@api/providers/web/api.provider';

import { apiClientUtils } from '@api/providers/web/api-client-utils.provider';
import { ScrollArea } from '@shared/ui/scroll-area.ui';
import { AiGenerationQualitySelector } from '@src/ai/schemas';
import { File } from '@shared/schemas';

type ChatWindowProps = {
    activeSessionId: string;
};

export function ChatWindow({ activeSessionId }: ChatWindowProps) {
    const { data: sessionQuery } = api.chat.getChatSession.useQuery({
        sessionId: activeSessionId,
    });

    const [selectedModel, setSelectedModel] =
        useState<AiGenerationQualitySelector>('Smart');

    // State to track scroll behavior
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [previousMessageCount, setPreviousMessageCount] = useState(0);

    const { setData: setSession } = apiClientUtils.chat.getChatSession;

    const { mutateAsync: sendMessage, isPending: isSendingMessage } =
        api.chat.sendMessage.useMutation();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async ({
        message,
        attachments,
    }: {
        message: string;
        attachments: File[];
    }) => {
        // When user sends a message, we want to auto-scroll
        setShouldAutoScroll(true);

        await sendMessage({
            sessionId: activeSessionId,
            content: message,
            model: selectedModel,
            attachments,
        });
    };

    const handleSuggestedQuestionSelect = async (question: string) => {
        await handleSendMessage({
            message: question,
            attachments: [],
        });
    };

    const handleModelChange = (model: AiGenerationQualitySelector) => {
        setSelectedModel(model);
    };

    // Function to check if user is near bottom of scroll area
    const checkIfNearBottom = () => {
        if (!scrollAreaRef.current) return true;

        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const threshold = 100; // pixels from bottom

        return scrollHeight - scrollTop - clientHeight < threshold;
    };

    // Function to scroll to bottom smoothly
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    // Handle scroll events to track user position
    const handleScroll = () => {
        const nearBottom = checkIfNearBottom();
        setIsNearBottom(nearBottom);

        // If user scrolls away from bottom, disable auto-scroll
        if (!nearBottom) {
            setShouldAutoScroll(false);
        }
    };

    api.chat.onChatMessageCreated.useSubscription(
        {
            sessionId: activeSessionId,
        },

        {
            onData: (newMessage) => {
                if (!sessionQuery || sessionQuery.error) return;

                // New message added - enable auto-scroll
                setShouldAutoScroll(true);

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

    const session = useMemo(() => {
        if (!sessionQuery || sessionQuery.error) return undefined;
        return sessionQuery.data;
    }, [sessionQuery]);

    // Function to determine if a message is loading
    const isMessageLoading = (
        messageId: string,
        role: string,
        content: string,
    ) => {
        // Show loading ONLY for assistant messages that have empty content (before streaming starts)
        // Once streaming begins (content is not empty), hide the loading indicator
        return role === 'assistant' && content === '';
    };

    // Smart auto-scroll effect - only scroll on new messages and when appropriate
    useEffect(() => {
        if (!session?.messages) return;

        const currentMessageCount = session.messages.length;
        const hasNewMessages = currentMessageCount > previousMessageCount;

        // Only auto-scroll if:
        // 1. There are new messages (not just updates)
        // 2. Auto-scroll is enabled
        // 3. User is near bottom OR this is the first load
        if (
            hasNewMessages &&
            shouldAutoScroll &&
            (isNearBottom || previousMessageCount === 0)
        ) {
            // Use immediate scroll for first load, smooth for new messages
            const behavior = previousMessageCount === 0 ? 'instant' : 'smooth';
            setTimeout(() => {
                scrollToBottom(behavior);
            }, 50);
        }

        setPreviousMessageCount(currentMessageCount);
    }, [
        session?.messages,
        shouldAutoScroll,
        isNearBottom,
        previousMessageCount,
    ]);

    // Re-enable auto-scroll when user scrolls back to bottom
    useEffect(() => {
        if (isNearBottom && !shouldAutoScroll) {
            setShouldAutoScroll(true);
        }
    }, [isNearBottom, shouldAutoScroll]);

    if (!session) return null;

    const { messages } = session;

    return (
        <Card className="sm:shadow-floating mt-0 flex h-full flex-col items-stretch justify-between space-y-0 border-none p-2 pt-0 shadow-none sm:border lg:max-h-[calc(100vh-6rem)]">
            <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea
                    ref={scrollAreaRef}
                    className="h-[calc(100vh-13rem)] md:h-[calc(100vh-14rem)] lg:h-[calc(100vh-10rem)]"
                    onScrollCapture={handleScroll}
                >
                    <div className="h-32 w-full lg:h-20"></div>
                    <div className="py-4">
                        {messages.map((message) => (
                            <ChatMessageComponent
                                key={message.id}
                                message={message}
                                isLoading={isMessageLoading(
                                    message.id,
                                    message.role,
                                    message.content,
                                )}
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

            <CardFooter className="bg-background sticky bottom-0 mt-auto flex flex-col items-stretch gap-2 border-t pt-2">
                <ChatInputComponent
                    onSend={({ message, attachments }) => {
                        void handleSendMessage({
                            message,
                            attachments,
                        });
                    }}
                    isLoading={isSendingMessage}
                    model={selectedModel}
                    onModelChange={handleModelChange}
                    placeholder="Type a message..."
                />
            </CardFooter>
        </Card>
    );
}
