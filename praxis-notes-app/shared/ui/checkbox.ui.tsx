import { ComponentProps } from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { CheckIcon } from 'lucide-react';

import { cn } from '@css/utils';

function Checkbox({
    className,
    ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-4 shrink-0 border-2 border-blue-200 bg-white outline-none',
                'hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm',
                'focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
                'data-[state=checked]:border-green-400 data-[state=checked]:bg-green-400 data-[state=checked]:text-white',
                'data-[state=checked]:hover:border-green-500 data-[state=checked]:hover:bg-green-500',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-200 disabled:hover:bg-white',
                'shadow-sm transition-all duration-200',
                'aria-invalid:border-orange-400 aria-invalid:ring-orange-300',
                className,
            )}
            style={{
                borderRadius: '3px 5px 4px 6px',
            }}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-all duration-200"
            >
                <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
