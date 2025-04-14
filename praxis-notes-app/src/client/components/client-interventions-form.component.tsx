import { useFormContext, useFieldArray } from 'react-hook-form';

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@ui/form.ui';

import { Button } from '@ui/button.ui';

import { Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@ui/select.ui';

import { BehaviorCheckItem } from './behavior-check-item.component';

import { ClientForm } from '../schemas';
import { Intervention } from '@src/intervention/schemas';
import { Behavior } from '@src/behavior/schemas';

type ClientInterventionsFormProps = {
    existingInterventions: Intervention[];
    existingBehaviors: Behavior[];
};

export function ClientInterventionsForm({
    existingInterventions,
    existingBehaviors,
}: ClientInterventionsFormProps) {
    const { control, watch } = useFormContext<ClientForm>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'interventions',
    });

    const behaviors = watch('behaviors');

    const addIntervention = () => {
        append({
            id: '',
            behaviorIds: [],
        });
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
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Interventions</h3>
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
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Intervention {index + 1}
                                    </CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            remove(index);
                                        }}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="text-destructive h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
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

                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select intervention" />
                                                    </SelectTrigger>
                                                </FormControl>

                                                <SelectContent>
                                                    {existingInterventions.map(
                                                        (intervention) => (
                                                            <SelectItem
                                                                key={
                                                                    intervention.id
                                                                }
                                                                value={
                                                                    intervention.id
                                                                }
                                                            >
                                                                {
                                                                    intervention.name
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
                                                    {behaviors.length === 0 ? (
                                                        <p className="text-muted-foreground text-sm">
                                                            No behaviors
                                                            available to
                                                            associate.
                                                        </p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                            {behaviorsData.map(
                                                                (behavior) => (
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
