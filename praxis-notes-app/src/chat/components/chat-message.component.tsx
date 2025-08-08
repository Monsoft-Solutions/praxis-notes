import { cn } from '@css/utils';
import type { ChatMessage } from '../schemas';
import ReactMarkdown from 'react-markdown';

import { Media } from '@shared/ui/media.ui';

type ChatMessageProps = {
    message: ChatMessage;
    isLoading?: boolean;
};

// Elegant typing indicator with wave animation
function TypingIndicator() {
    return (
        <div className="flex items-center space-x-1 py-2">
            <span className="font-nunito text-sm text-gray-600">
                AI is thinking
            </span>
            <div className="flex space-x-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
                <div
                    className="h-2 w-2 animate-pulse rounded-full bg-green-400"
                    style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                    className="h-2 w-2 animate-pulse rounded-full bg-orange-400"
                    style={{ animationDelay: '0.2s' }}
                ></div>
            </div>
        </div>
    );
}

export function ChatMessageComponent({
    message,
    isLoading = false,
}: ChatMessageProps) {
    const isUserMessage = message.role === 'user';

    return (
        <div
            className={cn(
                'flex w-full items-start gap-3 px-2 py-3 sm:gap-4 sm:px-4',
                isUserMessage ? 'justify-end' : 'justify-start',
            )}
        >
            <div
                className={cn(
                    'flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]',
                    isUserMessage ? 'items-end' : 'items-start',
                )}
            >
                {/* Message bubble with hand-drawn styling */}
                <div
                    className={cn(
                        'relative rounded-2xl border-2 bg-white p-4 shadow-md transition-all duration-300',
                        isUserMessage
                            ? 'border-blue-200 bg-blue-400 text-white'
                            : 'border-green-200 bg-white text-gray-800',
                        isLoading &&
                            !isUserMessage &&
                            'scale-[1.02] animate-pulse border-orange-200 shadow-lg',
                    )}
                    style={{
                        borderRadius: isUserMessage
                            ? '18px 20px 6px 18px' // User: sharp bottom-left corner
                            : '6px 18px 18px 20px', // Assistant: sharp top-left corner
                    }}
                >
                    {/* Small decorative element for speech bubble effect */}
                    {isUserMessage ? (
                        <div className="absolute -bottom-1 right-3 h-0 w-0 border-l-[8px] border-t-[8px] border-l-transparent border-t-blue-400"></div>
                    ) : (
                        <div className="absolute -top-1 left-3 h-0 w-0 border-b-[8px] border-r-[8px] border-b-green-200 border-r-transparent"></div>
                    )}

                    <div
                        className={cn(
                            'prose prose-sm max-w-none',
                            isUserMessage
                                ? 'prose-invert font-nunito text-white'
                                : 'prose-gray font-nunito prose-p:text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900',
                        )}
                    >
                        {isLoading && !isUserMessage ? (
                            <div className="space-y-3">
                                <TypingIndicator />
                            </div>
                        ) : (
                            <>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => (
                                            <p className="mb-2 leading-relaxed last:mb-0">
                                                {children}
                                            </p>
                                        ),
                                        code: ({ children, className }) => {
                                            const isInline = !className;
                                            return isInline ? (
                                                <code
                                                    className={cn(
                                                        'rounded px-1.5 py-0.5 font-mono text-sm',
                                                        isUserMessage
                                                            ? 'bg-blue-300 text-white'
                                                            : 'bg-gray-200 text-gray-800',
                                                    )}
                                                >
                                                    {children}
                                                </code>
                                            ) : (
                                                <code
                                                    className={cn(
                                                        'block overflow-x-auto rounded-lg p-3 font-mono text-sm',
                                                        isUserMessage
                                                            ? 'bg-blue-300 text-white'
                                                            : 'bg-gray-100 text-gray-800',
                                                    )}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },
                                        h1: ({ children }) => (
                                            <h1 className="font-quicksand text-shadow-sm mb-2 text-lg font-bold">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="font-quicksand text-shadow-sm mb-2 text-base font-bold">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="font-quicksand text-shadow-sm mb-1 text-sm font-bold">
                                                {children}
                                            </h3>
                                        ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>

                                {/* Attachments */}
                                {message.attachments.map(
                                    (attachment, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                'mt-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-2 transition-opacity duration-300',
                                                isLoading && 'opacity-50',
                                            )}
                                            style={{
                                                borderRadius:
                                                    '8px 10px 9px 11px',
                                            }}
                                        >
                                            <Media file={attachment} />
                                        </div>
                                    ),
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Timestamp - subtle and optional */}
                <div
                    className={cn(
                        'font-nunito px-2 text-[10px] text-gray-400 transition-opacity duration-300 sm:text-xs',
                        isLoading && 'opacity-50',
                    )}
                >
                    {/* Add timestamp if needed */}
                </div>
            </div>
        </div>
    );
}
