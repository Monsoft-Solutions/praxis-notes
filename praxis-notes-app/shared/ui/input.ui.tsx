import { forwardRef, type InputHTMLAttributes } from 'react';

import { z } from 'zod';

import { toast } from 'sonner';

import { cn } from '@css/utils';

const separators = ['.', ','] as const;

type Separator = (typeof separators)[number];

const preferredSeparator: Separator = '.';

const Input = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
>(({ className, type, onChange, ...props }, ref) => (
    <input
        type={type === 'number' ? 'text' : type}
        className={cn(
            'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
        )}
        ref={ref}
        onChange={
            type === 'number' || type === 'int'
                ? (e) => {
                      const strValue = e.target.value.replace(
                          new RegExp(`[${separators.join('')}]`, 'g'),
                          preferredSeparator,
                      );

                      const endsWithSeparator =
                          strValue.endsWith(preferredSeparator);

                      const strValueWithoutLeadingZeros = strValue.replace(
                          /^0+(?=\d)/,
                          '',
                      );

                      const parsing = z.coerce
                          .number()
                          .safeParse(strValueWithoutLeadingZeros);

                      if (!parsing.success) {
                          toast.warning('Please enter only numbers');
                          return;
                      }

                      const refinedValue = `${parsing.data}${endsWithSeparator ? preferredSeparator : ''}`;

                      e.target.value = refinedValue;

                      if (type === 'int') {
                          if (refinedValue.includes(preferredSeparator)) {
                              toast.warning('Please enter only whole numbers');
                              return;
                          }
                      }

                      onChange?.(e);
                  }
                : onChange
        }
        {...props}
    />
));
Input.displayName = 'Input';

export { Input };
