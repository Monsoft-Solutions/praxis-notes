import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@css/utils';

import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-quicksand font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    {
        variants: {
            variant: {
                default:
                    'bg-blue-400 text-white hover:bg-blue-500 border-radius-irregular',
                destructive:
                    'bg-red-500 text-white hover:bg-red-600 border-radius-irregular',
                outline:
                    'border-2 border-blue-200 bg-white text-blue-500 hover:bg-blue-50 hover:border-blue-300 border-radius-irregular',
                secondary:
                    'bg-green-400 text-white hover:bg-green-500 border-radius-irregular',
                ghost: 'bg-transparent text-blue-500 hover:bg-blue-100 hover:text-blue-600 shadow-none hover:shadow-sm border-radius-irregular',
                link: 'text-blue-500 underline-offset-4 hover:underline shadow-none hover:shadow-none hover:translate-y-0',
                success:
                    'bg-green-400 text-white hover:bg-green-500 border-radius-irregular',
                warning:
                    'bg-orange-400 text-white hover:bg-orange-500 border-radius-irregular',
                info: 'bg-yellow-400 text-gray-800 hover:bg-yellow-500 border-radius-irregular',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 px-3 text-xs',
                lg: 'h-11 px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonProps = {
    asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, style, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        // Apply irregular border radius inline style for hand-drawn effect
        const handDrawnStyle =
            variant !== 'link'
                ? {
                      borderRadius: '12px 14px 12px 16px',
                      ...style,
                  }
                : style;

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                style={handDrawnStyle}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
