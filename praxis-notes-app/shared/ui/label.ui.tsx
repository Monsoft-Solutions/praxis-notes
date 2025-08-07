import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ElementRef,
} from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@css/utils';

const labelVariants = cva(
    'text-sm font-quicksand font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-shadow-sm',
);

const Label = forwardRef<
    ElementRef<typeof LabelPrimitive.Root>,
    ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
