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

import { BehaviorCheckItem } from './behavior-check-item.component';

import { ClientForm } from '../schemas';
import { Intervention } from '@src/intervention/schemas';
import { Behavior } from '@src/behavior/schemas';
import { AbcSelector } from '@src/client-session/components/abc-selector.component';

import { api, apiClientUtils } from '@api/providers/web';

type ClientInterventionsFormProps = {
    existingInterventions: Intervention[];
    existingBehaviors: Behavior[];
};

export function ClientInterventionsForm({
    existingInterventions,
    existingBehaviors,
}: ClientInterventionsFormProps) {
    const { mutateAsync: createIntervention } =
        api.intervention.createIntervention.useMutation();

    const { control, watch } = useFormContext<ClientForm>();
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'interventions',
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

    const addIntervention = () => {
        prepend({
            id: 'New Intervention',
            behaviorIds: [],
        });
    };

    const handleRemoveIntervention = (index: number, fieldId: string) => {
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
                    onClick={addIntervention}
                    size="sm"
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Add Intervention
                </Button>
            </div>

            {behaviors.length === 0 ? (
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

                        return (
                            <AccordionItem
                                key={field.id}
                                value={field.id}
                                className="rounded-md border p-1"
                            >
                                <AccordionTrigger className="px-4">
                                    <div className="flex w-full items-center justify-between">
                                        <span className="font-medium">
                                            {interventionDetails?.name
                                                ? interventionDetails.name
                                                : 'Select Intervention'}
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
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="text-destructive h-4 w-4" />
                                        </Button>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-4">
                                    <div className="space-y-4 pt-2">
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
                                                        initValue={field.value}
                                                        items={
                                                            existingInterventions
                                                        }
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
                                                            if (result.error)
                                                                return null;

                                                            await apiClientUtils.intervention.getInterventions.invalidate();

                                                            return result.data;
                                                        }}
                                                    />

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
                                                name={`interventions.${index}.behaviorIds`}
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
