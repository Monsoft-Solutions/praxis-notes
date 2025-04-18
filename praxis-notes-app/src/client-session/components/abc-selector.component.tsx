import { useState } from 'react';

import { cn } from '@css/utils';

import { FormControl } from '@shared/ui/form.ui';

import MultipleSelector from '@shared/ui/select-multiple';

import { Check } from 'lucide-react';

import { Button } from '@ui/button.ui';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@ui/command.ui';

import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover.ui';

import { Label } from '@shared/ui/label.ui';

type AbcSelectorProps = {
    placeholder?: string;
    items: {
        id: string;
        name: string;
        isCustom: boolean;
    }[];
} & (
    | {
          multiple: true;
          onSelect: (ids: string[]) => void;
      }
    | {
          multiple?: false;
          onSelect: (id: string) => void;
      }
);

export function AbcSelector({
    placeholder,
    items,
    onSelect,
    multiple,
}: AbcSelectorProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);

    const groupBy = 'type';

    const options = items.map((item) => ({
        value: item.id,
        label: item.name,
        type: item.isCustom ? 'custom' : 'global',
    }));

    if (multiple) {
        return (
            <MultipleSelector
                defaultOptions={options}
                groupBy={groupBy}
                placeholder={placeholder}
                emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                    </p>
                }
                onChange={(items) => {
                    onSelect(items.map(({ value }) => value));
                }}
            />
        );
    }

    const groupOption: Record<string, typeof options> = {};
    options.forEach((option) => {
        const key = option[groupBy] || '';
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!groupOption[key]) {
            groupOption[key] = [];
        }
        groupOption[key].push(option);
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl className="w-full">
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            'justify-between',
                            !value && 'text-muted-foreground',
                        )}
                    >
                        {value
                            ? items.find((item) => item.id === value)?.name
                            : placeholder}
                    </Button>
                </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="search..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        {Object.keys(groupOption).map((key) => (
                            <CommandGroup key={key}>
                                <Label className="ml-2">{key}</Label>

                                {groupOption[key].map((option) => (
                                    <CommandItem
                                        value={option.label}
                                        key={option.value}
                                        onSelect={() => {
                                            setValue(option.value);
                                            onSelect(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        {option.label}
                                        <Check
                                            className={cn(
                                                'ml-auto',
                                                option.value === value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
