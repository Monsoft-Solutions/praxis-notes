import { FormEvent, useState } from 'react';
import { Button } from '@ui/button.ui';
import { Textarea } from '@ui/textarea.ui';
import { cn } from '@css/utils';
import { SendIcon } from 'lucide-react';

type ChatInputProps = {
    onSend: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
};

export function ChatInputComponent({
    onSend,
    isLoading = false,
    placeholder = 'Type your message here...',
}: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-background flex w-full items-end gap-2"
        >
            <Textarea
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                placeholder={placeholder}
                className={cn(
                    'bg-background border-muted max-h-[120px] min-h-[40px] resize-none rounded-full px-4 py-3',
                    isLoading && 'opacity-50',
                )}
                disabled={isLoading}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
            <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-[40px] w-[40px] shrink-0 rounded-full"
            >
                <SendIcon className="h-5 w-5" />
                <span className="sr-only">Send message</span>
            </Button>
        </form>
    );
}
