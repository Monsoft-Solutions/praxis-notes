import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@css/utils';

const Textarea = forwardRef<
    HTMLTextAreaElement,
    ComponentPropsWithoutRef<'textarea'>
>(({ className, style, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                'font-nunito flex min-h-[80px] w-full border-2 border-blue-200 bg-white px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-all duration-200 hover:border-blue-300 focus:border-blue-400',
                'resize-none shadow-sm hover:shadow-md focus:shadow-md',
                className,
            )}
            style={{
                borderRadius: '12px 14px 12px 16px',
                ...style,
            }}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

export { Textarea };
