import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';

import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form.ui';
import { Button } from '@ui/button.ui';
import { Plus, Trash2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion.ui';

import { InterventionsFormData } from '../edit-client-interventions.component';
import { Behavior } from '@src/behavior/schemas';
import { BehaviorCheckItem } from '../behavior-check-item.component';
import { ClientFormBehavior } from '../../schemas/client-form-behavior.schema';
import { Intervention } from '@src/intervention/schemas';
import { api, apiClientUtils } from '@api/providers/web';
import { AbcSelector } from '@src/client-session/components/abc-selector.component';
import { toast } from 'sonner';

type EditClientInterventionsFormProps = {
    existingBehaviors: Behavior[];
    existingInterventions: Intervention[];
};

export function EditClientInterventionsForm({
    existingBehaviors,
    existingInterventions,
}: EditClientInterventionsFormProps) {
    const { mutateAsync: createIntervention } =
        api.intervention.createIntervention.useMutation();

    const { control, watch } = useFormContext<InterventionsFormData>();
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'interventions',
    });

    const watchedInterventions = watch('interventions');
    const selectedInterventionIds = Array.isArray(watchedInterventions)
        ? watchedInterventions.map((i) => i.id)
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

    const addIntervention = () => {
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

    const handleRemoveIntervention = (index: number, fieldId: string) => {
        remove(index);
        setOpenAccordionItems((prev) => prev.filter((id) => id !== fieldId));
    };

    // Get the current values of all interventions
    const interventionsValues = watch('interventions');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={addIntervention}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Intervention
                </Button>
            </div>

            {existingBehaviors.length === 0 ? (
                <div className="bg-muted/20 rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                        You need to add behaviors first before adding
                        interventions.
                    </p>
                </div>
            ) : fields.length === 0 ? (
                <div className="bg-muted/20 rounded-md border py-8 text-center">
                    <p className="text-muted-foreground">
                        No interventions added yet. Click the button above to
                        add one.
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
                        const currentInterventionId = watch(
                            `interventions.${index}.id`,
                        );
                        const interventionDetails = existingInterventions.find(
                            (intervention) =>
                                intervention.id === currentInterventionId,
                        );
                        const interventionName =
                            interventionDetails?.name ?? 'Select Intervention';

                        const showSelector = watch(
                            `interventions.${index}.showSelector`,
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
                                            {interventionName}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveIntervention(
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
                                        {showSelector && (
                                            <FormField
                                                control={control}
                                                name={`interventions.${index}.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Intervention{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <AbcSelector
                                                            placeholder="Select intervention"
                                                            items={
                                                                existingInterventions
                                                            }
                                                            hideFromList={selectedInterventionIds.filter(
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
                                                                    await createIntervention(
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
                                                                await apiClientUtils.intervention.getInterventions.invalidate();
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
                                                name={`interventions.${index}.behaviorIds`}
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
