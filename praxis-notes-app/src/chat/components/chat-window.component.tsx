import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessageComponent } from './chat-message.component';
import { ChatInputComponent } from './chat-input.component';
import { ChatSuggestedQuestions } from './chat-suggested-questions.component';

import { api } from '@api/providers/web/api.provider';

import { apiClientUtils } from '@api/providers/web/api-client-utils.provider';
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
        <div
            className="relative flex min-h-[calc(100vh-8.5rem)] flex-col rounded-3xl border-2 border-green-200 bg-white md:max-h-[calc(100vh-19rem)] lg:max-h-[calc(100vh-8.5rem)]"
            style={{
                borderRadius: '25px 30px 20px 35px',
            }}
        >
            {/* Thumb tack - triangle style for variety */}
            <div className="absolute -top-2 right-8">
                <div className="h-0 w-0 border-b-[8px] border-l-[6px] border-r-[6px] border-b-orange-400 border-l-transparent border-r-transparent"></div>
            </div>

            {/* Chat messages area */}
            <div
                ref={scrollAreaRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 pt-28"
            >
                {/* Top spacing */}
                <div className="h-8 w-full lg:h-4"></div>

                <div className="space-y-4 pb-4">
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

                    {/* Welcome state with suggested questions */}
                    {messages.length === 0 && (
                        <div className="flex justify-center pt-8 lg:pt-12">
                            <ChatSuggestedQuestions
                                sessionId={activeSessionId}
                                onQuestionSelect={(question) => {
                                    void handleSuggestedQuestionSelect(
                                        question,
                                    );
                                }}
                                className="max-w-full px-2"
                            />
                        </div>
                    )}
                </div>

                {/* Bottom spacing */}
                <div className="h-4 w-full"></div>
            </div>

            {/* Chat input area */}
            <div
                className="mt-auto rounded-b-3xl border-t border-orange-200 bg-white/50 p-4 backdrop-blur-sm"
                style={{
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '35px',
                }}
            >
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
            </div>
        </div>
    );
}
