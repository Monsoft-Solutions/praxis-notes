import { X } from 'lucide-react';

import { cn } from '@css/utils';

type TagProps = {
    text: string;
    onRemove: () => void;
    className?: string;
};

export function Tag({ text, onRemove, className }: TagProps) {
    return (
        <div
            className={cn(
                'bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm',
                className,
            )}
        >
            <span>{text}</span>
            <button
                type="button"
                onClick={onRemove}
                className="hover:bg-primary/20 flex h-4 w-4 items-center justify-center rounded-full"
                aria-label={`Remove ${text}`}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
