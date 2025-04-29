import { useFieldArray, useFormContext } from 'react-hook-form';
import { useEffect, useRef } from 'react';

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

import { BehaviorsFormData } from './edit-client-behaviors.component';
import { ClientFormBehavior } from '../../schemas/client-form-behavior.schema';

import { Behavior } from '@src/behavior/schemas';
import { clientBehaviorTypeEnum } from '@src/behavior/enums';
import { AbcSelector } from '@src/client-session/components/abc-selector.component';

import { api, apiClientUtils } from '@api/providers/web';

export function EditClientBehaviorsForm({
    allBehaviors,
}: {
    allBehaviors: Behavior[];
}) {
    const { mutateAsync: createBehavior } =
        api.behavior.createBehavior.useMutation();

    const { control, watch } = useFormContext<BehaviorsFormData>();
    const previousFieldIds = useRef<string[]>([]);

    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'behaviors',
    });

    const watchedBehaviors = watch('behaviors');
    const selectedBehaviorsIds = Array.isArray(watchedBehaviors)
        ? watchedBehaviors.map((b: ClientFormBehavior) => b.id)
        : [];

    useEffect(() => {
        const currentFieldIds = fields.map((field) => field.id);

        previousFieldIds.current = currentFieldIds;
    }, [fields]);

    const addBehavior = ({ id }: { id: string }) => {
        prepend({
            id: id,
            baseline: 0,
            type: 'frequency',
            isExisting: false,
        });
    };

    const handleRemoveBehavior = (index: number) => {
        remove(index);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    onClick={() => {
                        addBehavior({ id: '' });
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
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2"
                >
                    {fields.map((field, index) => {
                        const currentBehaviorId = watch(
                            `behaviors.${index}.id`,
                        );
                        const isExisting = watch(
                            `behaviors.${index}.isExisting`,
                        );
                        const behaviorDetails = allBehaviors.find(
                            (b) => b.id === currentBehaviorId,
                        );
                        const behaviorName =
                            behaviorDetails?.name ?? 'Select Behavior';

                        return (
                            <AccordionItem
                                key={field.id}
                                value={field.id}
                                className="grid rounded-md border p-1 last:border"
                            >
                                <div className="flex items-center justify-between px-4">
                                    <AccordionTrigger className="flex-1">
                                        <div className="flex w-full items-center justify-between">
                                            <h4 className="text-lg font-medium">
                                                {behaviorName}
                                            </h4>
                                        </div>
                                    </AccordionTrigger>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            handleRemoveBehavior(index);
                                        }}
                                        className="ml-2 h-8 w-8"
                                    >
                                        <Trash2 className="text-destructive h-4 w-4" />
                                    </Button>
                                </div>
                                <AccordionContent className="px-4">
                                    <div className="space-y-4 pt-2">
                                        {!isExisting && (
                                            <FormField
                                                control={control}
                                                name={`behaviors.${index}.id`}
                                                render={({
                                                    field: idField,
                                                }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Behavior{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <AbcSelector
                                                            placeholder="Select behavior"
                                                            items={allBehaviors}
                                                            hideFromList={selectedBehaviorsIds.filter(
                                                                (id: string) =>
                                                                    id !==
                                                                    idField.value,
                                                            )}
                                                            onSelect={
                                                                idField.onChange
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
                                        )}

                                        <FormField
                                            control={control}
                                            name={`behaviors.${index}.type`}
                                            render={({ field: typeField }) => (
                                                <FormItem className="flex w-full flex-col">
                                                    <FormLabel>
                                                        Type{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            typeField.onChange
                                                        }
                                                        value={typeField.value}
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
                                                                        {type}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name={`behaviors.${index}.baseline`}
                                            render={({
                                                field: baselineField,
                                            }) => (
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
                                                            {...baselineField}
                                                            onChange={(e) => {
                                                                baselineField.onChange(
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    ) || 0,
                                                                );
                                                            }}
                                                            value={
                                                                baselineField.value ||
                                                                ''
                                                            }
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
