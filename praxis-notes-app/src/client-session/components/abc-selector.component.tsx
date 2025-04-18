import { useMemo, useState } from 'react';

import { cn } from '@css/utils';

import { toast } from 'sonner';

import { FormControl } from '@shared/ui/form.ui';

import MultipleSelector from '@shared/ui/select-multiple';

import { Check, PlusCircle } from 'lucide-react';

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

import { ConfirmationDialog } from '@shared/ui/confirmation-dialog.ui';

type AbcSelectorProps = {
    placeholder?: string;
    items: {
        id: string;
        name: string;
        isCustom: boolean;
    }[];
    create: (args: { name: string }) => Promise<{ id: string } | null>;
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
    create,
}: AbcSelectorProps) {
    const options = items.map((item) => ({
        value: item.id,
        label: item.name,
        type: item.isCustom ? 'custom' : 'global',
    }));

    const [open, setOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const selectedOptions = useMemo(() => {
        return options.filter((option) => selectedIds.includes(option.value));
    }, [options, selectedIds]);

    const [search, setSearch] = useState('');

    const groupBy = 'type';

    const handleCreate = async ({ name }: { name: string }) => {
        const createdItem = await create({ name });

        if (!createdItem) {
            toast.error('Failed to create custom option');
            return;
        }

        const { id } = createdItem;

        if (multiple) {
            const newIds = [...selectedIds, id];
            setSelectedIds(newIds);
            onSelect(newIds);
        } else {
            setSelectedId(id);
            onSelect(id);
        }

        setCreateDialogOpen(false);
        toast.success(`Created custom '${search}'`);
    };

    return (
        <>
            {multiple ? (
                <MultipleSelector
                    defaultOptions={options}
                    groupBy={groupBy}
                    placeholder={placeholder}
                    value={selectedOptions}
                    creatable
                    emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                            no results found.
                        </p>
                    }
                    onChange={(selectedOptions) => {
                        const newSelectedIds = selectedOptions.map(
                            ({ value }) => value,
                        );

                        const lastValue = newSelectedIds.at(-1);

                        if (
                            lastValue === undefined ||
                            options.some(({ value }) => value === lastValue)
                        ) {
                            setSelectedIds(newSelectedIds);
                            onSelect(newSelectedIds);
                        } else {
                            setSearch(lastValue);
                            setCreateDialogOpen(true);
                        }
                    }}
                />
            ) : (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <FormControl className="w-full">
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    'justify-between',
                                    !selectedId && 'text-muted-foreground',
                                )}
                            >
                                {selectedId
                                    ? items.find(
                                          (item) => item.id === selectedId,
                                      )?.name
                                    : placeholder}
                            </Button>
                        </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput
                                placeholder="search..."
                                className="h-9"
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                {Object.entries(
                                    options.reduce<
                                        Record<string, typeof options>
                                    >((acc, option) => {
                                        const key = option[groupBy] || '';
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(option);
                                        return acc;
                                    }, {}),
                                ).map(([key, options]) => (
                                    <CommandGroup key={key}>
                                        <Label className="ml-2">{key}</Label>

                                        {options.map((option) => (
                                            <CommandItem
                                                value={option.label}
                                                key={option.value}
                                                onSelect={() => {
                                                    setSelectedId(option.value);
                                                    onSelect(option.value);
                                                    setOpen(false);
                                                }}
                                            >
                                                {option.label}
                                                <Check
                                                    className={cn(
                                                        'ml-auto',
                                                        option.value ===
                                                            selectedId
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ))}

                                {search && (
                                    <CommandItem
                                        onSelect={() => {
                                            setCreateDialogOpen(true);
                                        }}
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Create &quot;{search}&quot;
                                    </CommandItem>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
            {/* confirmation dialog for creating custom options */}
            <ConfirmationDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                title="Create custom option ?"
                description={`Do you want to create '${search}' ?`}
                confirmLabel="Create"
                destructive
                onConfirm={() => {
                    void handleCreate({ name: search });
                }}
                onCancel={() => {
                    setCreateDialogOpen(false);
                }}
            />
        </>
    );
}
