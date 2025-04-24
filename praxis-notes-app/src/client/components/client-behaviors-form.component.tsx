import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@ui/form.ui';

import { Input } from '@ui/input.ui';

import { Button } from '@ui/button.ui';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion.ui';

import { Plus, Trash2 } from 'lucide-react';

import { ClientForm } from '../schemas';

import { Behavior } from '@src/behavior/schemas';
import { clientBehaviorTypeEnum } from '@src/behavior/enums';
import { AbcSelector } from '@src/client-session/components/abc-selector.component';

import { api, apiClientUtils } from '@api/providers/web';

export function ClientBehaviorsForm({
    existingBehaviors,
}: {
    existingBehaviors: Behavior[];
}) {
    const { mutateAsync: createBehavior } =
        api.behavior.createBehavior.useMutation();

    const { control, watch } = useFormContext<ClientForm>();
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'behaviors',
    });

    const selectedBehaviorsIds = fields.map((_, index) => {
        const currentBehaviorId = watch(`behaviors.${index}.id`);
        return currentBehaviorId;
    });

    useEffect(() => {
        // Find any new fields by comparing with previous field IDs
        const currentFieldIds = fields.map((field) => field.id);
        const newFieldIds = currentFieldIds.filter(
            (id) => !previousFieldIds.current.includes(id),
        );

        // If new fields exist, replace open accordion items with only the new ones
        if (newFieldIds.length > 0) {
            setOpenAccordionItems(newFieldIds);
        }

        // Update the ref with current field IDs
        previousFieldIds.current = currentFieldIds;
    }, [fields]);

    const addBehavior = ({ id }: { id: string }) => {
        prepend({
            id: id,
            baseline: 0,
            type: 'frequency',
        });
    };

    const handleRemoveBehavior = (index: number, fieldId: string) => {
        remove(index);
        setOpenAccordionItems((prev) => prev.filter((id) => id !== fieldId));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={() => {
                        addBehavior({ id: 'Add a behavior' });
                    }}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Behavior
                </Button>
            </div>

            {fields.length === 0 ? (
                <div className="bg-muted/20 rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                        No behaviors added yet. Click the button above to add a
                        behavior.
                    </p>
                </div>
            ) : (
                <Accordion
                    type="multiple"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                    className="space-y-4"
                >
                    {fields.map((field, index) => {
                        const currentBehaviorId = watch(
                            `behaviors.${index}.id`,
                        );
                        const behaviorDetails = existingBehaviors.find(
                            (b) => b.id === currentBehaviorId,
                        );

                        return (
                            <AccordionItem
                                key={field.id}
                                value={field.id}
                                className="rounded-md border p-1"
                            >
                                <AccordionTrigger className="px-4">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-medium">
                                            {behaviorDetails?.name
                                                ? behaviorDetails.name
                                                : 'Select Behavior'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveBehavior(
                                                    index,
                                                    field.id,
                                                );
                                            }}
                                            className="ml-2 h-8 w-8"
                                        >
                                            <Trash2 className="text-destructive h-4 w-4" />
                                        </Button>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-4">
                                    <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <FormField
                                                control={control}
                                                name={`behaviors.${index}.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Behavior{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>

                                                        <AbcSelector
                                                            placeholder="Select behavior"
                                                            items={
                                                                existingBehaviors
                                                            }
                                                            hideFromList={
                                                                selectedBehaviorsIds
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            create={async ({
                                                                name,
                                                            }) => {
                                                                const result =
                                                                    await createBehavior(
                                                                        {
                                                                            name,
                                                                            description:
                                                                                '',
                                                                        },
                                                                    );
                                                                if (
                                                                    result.error
                                                                )
                                                                    return null;

                                                                await apiClientUtils.behavior.getBehaviors.invalidate();

                                                                return result.data;
                                                            }}
                                                        />

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={control}
                                                name={`behaviors.${index}.type`}
                                                render={({
                                                    field: formField,
                                                }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Type{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>

                                                        <Select
                                                            onValueChange={
                                                                formField.onChange
                                                            }
                                                            defaultValue={
                                                                formField.value
                                                            }
                                                            value={
                                                                formField.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                {clientBehaviorTypeEnum.options.map(
                                                                    (type) => (
                                                                        <SelectItem
                                                                            key={
                                                                                type
                                                                            }
                                                                            value={
                                                                                type
                                                                            }
                                                                        >
                                                                            {
                                                                                type
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={control}
                                            name={`behaviors.${index}.baseline`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Baseline{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FormLabel>

                                                    <FormControl>
                                                        <Input
                                                            type="int"
                                                            placeholder="Enter baseline value"
                                                            {...field}
                                                        />
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
