import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';

import { api, apiClientUtils } from '@api/providers/web';

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@ui/form.ui';

import { Input } from '@ui/input.ui';
import { Button } from '@ui/button.ui';

import { Plus, Trash2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion.ui';

import { ClientForm } from '../schemas';

import { ReplacementProgram } from '@src/replacement-program/schemas';

import { toast } from 'sonner';

import { BehaviorCheckItem } from './behavior-check-item.component';
import { AbcSelector } from '@src/client-session/components/abc-selector.component';

import { Behavior } from '@src/behavior/schemas';

type ClientReplacementProgramsFormProps = {
    existingPrograms: ReplacementProgram[];
    existingBehaviors: Behavior[];
};

export function ClientReplacementProgramsForm({
    existingPrograms,
    existingBehaviors,
}: ClientReplacementProgramsFormProps) {
    const { mutateAsync: createReplacementProgram } =
        api.replacementProgram.createReplacementProgram.useMutation();

    const { control, watch } = useFormContext<ClientForm>();
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'replacementPrograms',
    });

    const behaviors = watch('behaviors');

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

    const addReplacementProgram = ({ id }: { id: string }) => {
        if (behaviors.length === 0) {
            toast.error('You need to add behaviors first');
            return;
        }

        prepend({
            id,
            baseline: 0,
            behaviorIds: [],
        });
    };

    const handleRemoveProgram = (index: number, fieldId: string) => {
        remove(index);
        setOpenAccordionItems((prev) => prev.filter((id) => id !== fieldId));
    };

    const behaviorsData = behaviors
        .map((behavior) => {
            const existingBehavior = existingBehaviors.find(
                (b) => b.id === behavior.id,
            );

            if (!existingBehavior) return undefined;

            return {
                ...behavior,
                ...existingBehavior,
            };
        })
        .filter((b) => b !== undefined);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={() => {
                        addReplacementProgram({ id: 'New Program' });
                    }}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Program
                </Button>
            </div>

            {behaviors.length === 0 ? (
                <div className="bg-muted/20 rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                        You need to add behaviors first before adding
                        replacement programs.
                    </p>
                </div>
            ) : fields.length === 0 ? (
                <div className="bg-muted/20 rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                        No replacement programs added yet. Click the button
                        above to add one.
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
                        const currentProgramId = watch(
                            `replacementPrograms.${index}.id`,
                        );
                        const programDetails = existingPrograms.find(
                            (program) => program.id === currentProgramId,
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
                                            {programDetails?.name
                                                ? programDetails.name
                                                : 'Select Program'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveProgram(
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
                                        <FormField
                                            control={control}
                                            name={`replacementPrograms.${index}.id`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>
                                                        Program{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FormLabel>

                                                    <AbcSelector
                                                        placeholder="Select replacement program"
                                                        items={existingPrograms}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        create={async ({
                                                            name,
                                                        }) => {
                                                            const result =
                                                                await createReplacementProgram(
                                                                    {
                                                                        name,
                                                                        description:
                                                                            '',
                                                                    },
                                                                );
                                                            if (result.error)
                                                                return null;
                                                            await apiClientUtils.replacementProgram.getReplacementPrograms.invalidate();
                                                            return result.data;
                                                        }}
                                                    />

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name={`replacementPrograms.${index}.baseline`}
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
                                                            type="number"
                                                            placeholder="Enter baseline value"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ''
                                                                        ? 0
                                                                        : parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <FormLabel>
                                                Associated Behaviors{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>

                                            <FormField
                                                control={control}
                                                name={`replacementPrograms.${index}.behaviorIds`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="space-y-2">
                                                            {behaviors.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-sm">
                                                                    No behaviors
                                                                    available to
                                                                    associate.
                                                                </p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                                    {behaviorsData.map(
                                                                        (
                                                                            behavior,
                                                                        ) => (
                                                                            <BehaviorCheckItem
                                                                                key={
                                                                                    behavior.id
                                                                                }
                                                                                behavior={
                                                                                    behavior
                                                                                }
                                                                                isChecked={field.value.includes(
                                                                                    behavior.id,
                                                                                )}
                                                                                onChange={(
                                                                                    checked,
                                                                                ) => {
                                                                                    const withoutThisBehavior =
                                                                                        field.value.filter(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                id !==
                                                                                                behavior.id,
                                                                                        );

                                                                                    const updatedIndices =
                                                                                        checked
                                                                                            ? [
                                                                                                  ...withoutThisBehavior,
                                                                                                  behavior.id,
                                                                                              ]
                                                                                            : withoutThisBehavior;

                                                                                    field.onChange(
                                                                                        updatedIndices,
                                                                                    );
                                                                                }}
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
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
