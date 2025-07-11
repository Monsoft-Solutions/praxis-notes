import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';

import { api, apiClientUtils } from '@api/providers/web';

import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form.ui';

import { Button } from '@ui/button.ui';

import { Plus, Trash2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion.ui';

import { ReplacementProgramsFormData } from './edit-client-replacement-programs.component';

import { ReplacementProgram } from '@src/replacement-program/schemas';

import { toast } from 'sonner';

import { AbcSelector } from '@src/client-session/components/abc-selector.component';

import { Behavior } from '@src/behavior/schemas';
import { BehaviorCheckItem } from '../behavior-check-item.component';
import { ClientFormBehavior } from '../../schemas/client-form-behavior.schema';

type ClientReplacementProgramsFormProps = {
    existingPrograms: ReplacementProgram[];
    existingBehaviors: Behavior[];
};

export function EditClientReplacementProgramsForm({
    existingPrograms,
    existingBehaviors,
}: ClientReplacementProgramsFormProps) {
    const { mutateAsync: createReplacementProgram } =
        api.replacementProgram.createReplacementProgram.useMutation();

    const { control, watch } = useFormContext<ReplacementProgramsFormData>();
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'replacementPrograms',
    });

    const watchedBehaviors = watch('replacementPrograms');
    const selectedProgramIds = Array.isArray(watchedBehaviors)
        ? watchedBehaviors.map((p) => p.id)
        : [];

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

    const addReplacementProgram = () => {
        if (existingBehaviors.length === 0) {
            toast.error('You need to add behaviors first');
            return;
        }

        prepend({
            id: '',
            behaviorIds: [],
            showSelector: true,
        });
    };

    const handleRemoveProgram = (index: number, fieldId: string) => {
        remove(index);
        setOpenAccordionItems((prev) => prev.filter((id) => id !== fieldId));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={addReplacementProgram}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Program
                </Button>
            </div>

            {existingBehaviors.length === 0 ? (
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
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                    {fields.map((field, index) => {
                        const currentProgramId = watch(
                            `replacementPrograms.${index}.id`,
                        );
                        const programDetails = existingPrograms.find(
                            (program) => program.id === currentProgramId,
                        );
                        const programName =
                            programDetails?.name ?? 'Select Program';

                        const showSelector = watch(
                            `replacementPrograms.${index}.showSelector`,
                        );

                        return (
                            <AccordionItem
                                key={field.id}
                                value={field.id}
                                className="rounded-md border p-1 last:border"
                            >
                                <div className="flex items-center justify-between px-4">
                                    <AccordionTrigger className="flex-1">
                                        <div className="flex w-full items-center justify-between">
                                            <h4 className="text-lg">
                                                {programName}
                                            </h4>
                                        </div>
                                    </AccordionTrigger>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
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

                                <AccordionContent className="px-4">
                                    <div className="space-y-4 pt-2">
                                        {showSelector && (
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
                                                            items={
                                                                existingPrograms
                                                            }
                                                            hideFromList={selectedProgramIds.filter(
                                                                (id) =>
                                                                    id !==
                                                                    field.value,
                                                            )}
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
                                                                if (
                                                                    result.error
                                                                )
                                                                    return null;
                                                                await apiClientUtils.replacementProgram.getReplacementPrograms.invalidate();
                                                                return result.data;
                                                            }}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

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
                                                            {existingBehaviors.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-sm">
                                                                    No behaviors
                                                                    available to
                                                                    associate.
                                                                </p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                                    {existingBehaviors.map(
                                                                        (
                                                                            behavior,
                                                                        ) => {
                                                                            // Create a combined behavior object that satisfies both types
                                                                            const enhancedBehavior: Behavior &
                                                                                ClientFormBehavior =
                                                                                {
                                                                                    ...behavior,
                                                                                    // Add ClientFormBehavior properties
                                                                                    type: 'frequency',
                                                                                    baseline: 0,
                                                                                    isExisting:
                                                                                        true,
                                                                                };

                                                                            return (
                                                                                <BehaviorCheckItem
                                                                                    key={
                                                                                        behavior.id
                                                                                    }
                                                                                    behavior={
                                                                                        enhancedBehavior
                                                                                    }
                                                                                    isChecked={field.value.includes(
                                                                                        behavior.id,
                                                                                    )}
                                                                                    onChange={(
                                                                                        checked: boolean,
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
                                                                            );
                                                                        },
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
