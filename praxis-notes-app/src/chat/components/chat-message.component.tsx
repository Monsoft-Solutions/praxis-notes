import { cn } from '@css/utils';
import { Card } from '@ui/card.ui';
import type { ChatMessage } from '../schemas';

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
                'flex w-full items-start gap-4 p-4',
                isUserMessage ? 'justify-end' : 'justify-start',
            )}
        >
            <div
                className={cn(
                    'flex flex-col gap-2',
                    isUserMessage ? 'items-end' : 'items-start',
                )}
            >
                <Card
                    className={cn(
                        'max-w-[80%] overflow-hidden rounded-xl p-4',
                        isUserMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    <div
                        className={cn(
                            'prose prose-sm',
                            isLoading && 'animate-pulse',
                        )}
                    >
                        {message.content}
                    </div>
                </Card>

                <p className="text-muted-foreground text-xs">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
}
