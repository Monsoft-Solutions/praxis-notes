import { cn } from '@css/utils';
import { Card } from '@ui/card.ui';
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
            <div className="flex space-x-1">
                <div
                    className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60"
                    style={{
                        animation: 'wave 1.4s ease-in-out infinite',
                        animationDelay: '0s',
                    }}
                />
                <div
                    className="h-2.5 w-2.5 animate-pulse rounded-full bg-current opacity-75"
                    style={{
                        animation: 'wave 1.4s ease-in-out infinite',
                        animationDelay: '0.2s',
                    }}
                />
                <div
                    className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60"
                    style={{
                        animation: 'wave 1.4s ease-in-out infinite',
                        animationDelay: '0.4s',
                    }}
                />
            </div>

            <style>{`
                @keyframes wave {
                    0%,
                    60%,
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-8px) scale(1.2);
                        opacity: 1;
                    }
                }
            `}</style>
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
                'flex w-full items-start gap-2 px-3 py-2 sm:gap-4 sm:px-4',
                isUserMessage ? 'justify-end' : 'justify-start',
            )}
        >
            <div
                className={cn(
                    'flex flex-col gap-1 sm:gap-2',
                    isUserMessage ? 'items-end' : 'items-start',
                )}
            >
                <Card
                    className={cn(
                        'overflow-hidden p-4 shadow-sm transition-all duration-300',
                        isUserMessage
                            ? 'bg-primary rounded-2xl rounded-tr-sm text-white'
                            : 'bg-muted border-muted rounded-2xl rounded-tl-sm dark:text-slate-100',
                        isLoading &&
                            !isUserMessage &&
                            'scale-[1.02] animate-pulse shadow-md',
                    )}
                >
                    <div
                        className={cn(
                            'p-0',
                            isUserMessage
                                ? 'prose prose-sm text-white'
                                : 'prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-black/10 dark:prose-pre:bg-white/10',
                        )}
                    >
                        {isLoading && !isUserMessage ? (
                            <div className="space-y-3">
                                <TypingIndicator />
                            </div>
                        ) : (
                            <>
                                <ReactMarkdown>{message.content}</ReactMarkdown>

                                {message.attachments.map(
                                    (attachment, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                'transition-opacity duration-300',
                                                isLoading && 'opacity-50',
                                            )}
                                        >
                                            <Media file={attachment} />
                                        </div>
                                    ),
                                )}
                            </>
                        )}
                    </div>
                </Card>
                <p
                    className={cn(
                        'text-muted-foreground px-1 text-[10px] transition-opacity duration-300 sm:text-xs',
                        isLoading && 'opacity-50',
                    )}
                ></p>
            </div>
        </div>
    );
}
