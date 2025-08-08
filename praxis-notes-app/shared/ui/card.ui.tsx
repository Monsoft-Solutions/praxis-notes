import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@css/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
    'relative bg-white shadow-lg border-2 border-solid transition-all duration-200 hover:shadow-xl',
    {
        variants: {
            theme: {
                default: 'border-blue-200',
                blue: 'border-blue-200',
                green: 'border-green-200',
                orange: 'border-orange-200',
                yellow: 'border-yellow-200',
                purple: 'border-purple-200',
            },
            thumbTack: {
                none: '',
                round: '',
                square: '',
                triangle: '',
            },
        },
        defaultVariants: {
            theme: 'default',
            thumbTack: 'round',
        },
    },
);

const thumbTackVariants = cva('absolute z-10', {
    variants: {
        type: {
            round: '-top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform',
            square: '-top-1.5 right-8 h-3 w-3 rotate-45 transform shadow-sm',
            triangle: '-top-2 left-8',
        },
        theme: {
            default: 'text-blue-400',
            blue: 'text-blue-400',
            green: 'text-green-400',
            orange: 'text-orange-400',
            yellow: 'text-yellow-400',
            purple: 'text-purple-400',
        },
    },
    defaultVariants: {
        type: 'round',
        theme: 'default',
    },
});

export type CardProps = {
    theme?: 'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'purple';
    thumbTack?: 'none' | 'round' | 'square' | 'triangle';
} & HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardVariants>;

const ThumbTack = ({
    type,
    theme,
}: {
    type: 'round' | 'square' | 'triangle';
    theme: 'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'purple';
}) => {
    const baseClasses = thumbTackVariants({ type, theme });

    switch (type) {
        case 'round':
            return (
                <div className={baseClasses}>
                    <div className="h-full w-full rounded-full bg-current shadow-sm"></div>
                    <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                </div>
            );
        case 'square':
            return <div className={cn(baseClasses, 'bg-current')}></div>;
        case 'triangle':
            return (
                <div className={baseClasses}>
                    <div
                        className="border-b-[8px] border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent"
                        style={{ borderBottomColor: 'currentColor' }}
                    ></div>
                </div>
            );
        default:
            return null;
    }
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        { className, theme = 'default', thumbTack = 'round', style, ...props },
        ref,
    ) => (
        <div
            ref={ref}
            className={cn(cardVariants({ theme }), 'p-6', className)}
            style={{
                borderRadius: '25px 30px 20px 35px',
                ...style,
            }}
            {...props}
        >
            {thumbTack !== 'none' && (
                <ThumbTack type={thumbTack} theme={theme} />
            )}
            {/* Content container with top padding for thumb tack */}
            <div className="pt-2">{props.children}</div>
        </div>
    ),
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 pb-4', className)}
            {...props}
        />
    ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'font-quicksand text-shadow-sm text-xl font-bold leading-none tracking-tight',
            className,
        )}
        {...props}
    >
        {children}
    </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-muted-foreground font-nunito text-sm', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('font-nunito', className)} {...props} />
    ),
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center pt-6', className)}
            {...props}
        />
    ),
);
CardFooter.displayName = 'CardFooter';

export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
};
