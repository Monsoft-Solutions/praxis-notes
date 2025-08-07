import { useState } from 'react';

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

import { ConfirmationDialog } from '@shared/ui/confirmation-dialog.ui';

type AbcSelectorProps = {
    placeholder?: string;
    items: {
        id: string;
        name: string;
        isCustom?: boolean;
        isClient?: boolean;
    }[];
    hideFromList?: string[];
    create?: (args: { name: string }) => Promise<{ id: string } | null>;
} & (
    | {
          multiple: true;
          onSelect: (ids: string[]) => void;
          initValue?: string[];
      }
    | {
          multiple?: false;
          onSelect: (id: string) => void;
          initValue?: string;
      }
);

const types = ['client', 'custom', 'global'] as const;
type Type = (typeof types)[number];

// Type labels with proper casing and descriptions
const typeLabels: Record<Type, string> = {
    client: 'Client Specific',
    custom: 'Custom Created',
    global: 'Global Templates',
};

export function AbcSelector({
    placeholder = 'Select an option...',
    items,
    onSelect,
    multiple,
    create,
    hideFromList,
    initValue,
}: AbcSelectorProps) {
    const allOptions = items
        .map((item) => ({
            value: item.id,
            label: item.name,
            type: item.isClient
                ? 'client'
                : item.isCustom
                  ? 'custom'
                  : ('global' as Type),
        }))
        .toSorted((a, b) => types.indexOf(a.type) - types.indexOf(b.type));

    const [open, setOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const [selectedId, setSelectedId] = useState<string | null>(
        !multiple && initValue ? initValue : null,
    );
    const [selectedIds, setSelectedIds] = useState<string[]>(
        multiple && initValue ? initValue : [],
    );

    const selectedOptions = selectedIds
        .map((id) => allOptions.find((option) => option.value === id))
        .filter((option) => option !== undefined);

    const availableOptions = allOptions.filter(
        ({ value }) =>
            !hideFromList ||
            !hideFromList.includes(value) ||
            (!multiple && value === selectedId) ||
            (multiple &&
                !selectedOptions.some(
                    (selectedOption) => value === selectedOption.value,
                )),
    );

    const [search, setSearch] = useState('');

    const groupBy = 'type';

    const handleCreate = async ({ name }: { name: string }) => {
        if (!create) return;
        const createdItem = await create({ name });

        if (!createdItem) {
            toast.error('Failed to create custom option');
            return;
        }

        const { id } = createdItem;

        if (multiple) {
            setSelectedIds((prev) => {
                const newIds = [...prev, id];
                onSelect(newIds);
                return newIds;
            });
        } else {
            setSelectedId(id);
            onSelect(id);
        }

        setCreateDialogOpen(false);
        setSearch(''); // Clear search after creation
        toast.success(`Created custom '${name}'`);
    };

    return (
        <>
            {multiple ? (
                <MultipleSelector
                    options={availableOptions}
                    groupBy={groupBy}
                    placeholder={placeholder}
                    value={selectedOptions}
                    creatable={!!create}
                    emptyIndicator={
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="font-nunito text-muted-foreground text-sm">
                                No results found
                            </p>
                            <p className="font-nunito text-muted-foreground/70 mt-1 text-xs">
                                Try adjusting your search terms
                            </p>
                        </div>
                    }
                    onChange={(newSelectedOptions) => {
                        const newSelectedIds = newSelectedOptions.map(
                            ({ value }) => value,
                        );

                        const customOption = newSelectedIds.find((id) =>
                            allOptions.every((option) => option.value !== id),
                        );

                        if (customOption) {
                            setSearch(customOption);
                            setCreateDialogOpen(true);
                        } else {
                            setSelectedIds(newSelectedIds);
                            onSelect(newSelectedIds);
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
                                aria-expanded={open}
                                className={cn(
                                    'font-nunito w-full justify-between',
                                    !selectedId && 'text-muted-foreground',
                                )}
                            >
                                <span className="truncate">
                                    {selectedId
                                        ? items.find(
                                              (item) => item.id === selectedId,
                                          )?.name
                                        : placeholder}
                                </span>
                                <div className="flex items-center gap-1 text-xs opacity-60">
                                    {open ? '↑' : '↓'}
                                </div>
                            </Button>
                        </FormControl>
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0"
                        style={{ borderRadius: '15px 18px 14px 20px' }}
                    >
                        <Command className="rounded-lg">
                            <CommandInput
                                placeholder="Search options..."
                                className="font-nunito h-10"
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList className="max-h-64">
                                <CommandEmpty className="py-6 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="font-nunito text-muted-foreground text-sm">
                                            No options found
                                        </p>
                                        {create && search && (
                                            <p className="font-nunito text-muted-foreground/70 text-xs">
                                                Try creating a custom option
                                                below
                                            </p>
                                        )}
                                    </div>
                                </CommandEmpty>

                                {Object.entries(
                                    availableOptions.reduce<
                                        Record<string, typeof availableOptions>
                                    >((acc, option) => {
                                        const key = option[groupBy];
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(option);
                                        return acc;
                                    }, {}),
                                ).map(([key, options]) => (
                                    <CommandGroup
                                        key={key}
                                        heading={typeLabels[key as Type]}
                                        className="font-quicksand font-semibold"
                                    >
                                        {options.map((option) => (
                                            <CommandItem
                                                value={option.label}
                                                key={option.value}
                                                onSelect={() => {
                                                    setSelectedId(option.value);
                                                    onSelect(option.value);
                                                    setOpen(false);
                                                    setSearch(''); // Clear search on selection
                                                }}
                                                className="font-nunito flex items-center"
                                            >
                                                <span className="flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                <Check
                                                    className={cn(
                                                        'ml-2 h-4 w-4 flex-shrink-0 text-blue-500',
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

                                {search && create && (
                                    <CommandItem
                                        onSelect={() => {
                                            setCreateDialogOpen(true);
                                        }}
                                        className="font-nunito mt-1 flex items-center gap-2 border-t border-blue-100 pt-2"
                                    >
                                        <PlusCircle className="h-4 w-4 text-green-500" />
                                        <span className="flex-1">
                                            Create{' '}
                                            <strong>
                                                &quot;{search}&quot;
                                            </strong>
                                        </span>
                                    </CommandItem>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {/* Confirmation dialog for creating custom options */}
            <ConfirmationDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                title="Create Custom Option"
                description={`Do you want to create "${search}" as a new custom option?`}
                confirmLabel="Create Option"
                destructive={false}
                onConfirm={() => {
                    void handleCreate({ name: search });
                }}
                onCancel={() => {
                    setCreateDialogOpen(false);
                    setSearch(''); // Clear search on cancel
                }}
            />
        </>
    );
}
