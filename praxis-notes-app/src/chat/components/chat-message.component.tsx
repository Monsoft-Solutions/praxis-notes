import { cn } from '@css/utils';
import { Card } from '@ui/card.ui';
import type { ChatMessage } from '../schemas';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
    message: ChatMessage;
    isLoading?: boolean;
};

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
                        'max-w-[85%] overflow-hidden shadow-sm sm:max-w-[80%] md:max-w-[75%]',
                        isUserMessage
                            ? 'bg-primary rounded-2xl rounded-tr-sm text-white'
                            : 'bg-muted border-muted rounded-2xl rounded-tl-sm dark:text-slate-100',
                    )}
                >
                    <div
                        className={cn(
                            'px-3 py-2 sm:px-4 sm:py-3',
                            isUserMessage
                                ? 'prose prose-sm text-white'
                                : 'prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-2 prose-pre:bg-black/10 dark:prose-pre:bg-white/10',
                            isLoading && 'animate-pulse opacity-70',
                        )}
                    >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                </Card>

                <p className="text-muted-foreground px-1 text-[10px] sm:text-xs">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
}
