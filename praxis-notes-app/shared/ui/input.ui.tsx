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
>(({ className, type, onChange, style, ...props }, ref) => (
    <input
        type={type === 'number' ? 'text' : type}
        className={cn(
            'font-nunito flex h-11 w-full border-2 border-blue-200 bg-white px-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200 hover:border-blue-300 focus:border-blue-400',
            'shadow-sm hover:shadow-md focus:shadow-md',
            className,
        )}
        style={{
            borderRadius: '12px 14px 12px 16px',
            ...style,
        }}
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
