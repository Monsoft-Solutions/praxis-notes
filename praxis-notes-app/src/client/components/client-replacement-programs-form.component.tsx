import { useFormContext, useFieldArray } from 'react-hook-form';

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
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { ClientForm } from '../schemas';

import { ReplacementProgram } from '@src/replacement-program/schemas';
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from '@ui/select.ui';

import { toast } from 'sonner';
import { BehaviorCheckItem } from './behavior-check-item.component';

import { Behavior } from '@src/behavior/schemas';

type ClientReplacementProgramsFormProps = {
    existingPrograms: ReplacementProgram[];
    existingBehaviors: Behavior[];
};

export function ClientReplacementProgramsForm({
    existingPrograms,
    existingBehaviors,
}: ClientReplacementProgramsFormProps) {
    const { control, watch } = useFormContext<ClientForm>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'replacementPrograms',
    });

    const behaviors = watch('behaviors');

    const addReplacementProgram = ({ id }: { id: string }) => {
        if (behaviors.length === 0) {
            toast.error('You need to add behaviors first');
            return;
        }

        append({
            id,
            baseline: 0,
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
                <h3 className="text-lg font-medium">Replacement Programs</h3>
                <Button
                    type="button"
                    onClick={() => {
                        addReplacementProgram({ id: '' });
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
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Program {index + 1}
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
                                    name={`replacementPrograms.${index}.id`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Program{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>

                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select program" />
                                                    </SelectTrigger>
                                                </FormControl>

                                                <SelectContent>
                                                    {existingPrograms.map(
                                                        (program) => (
                                                            <SelectItem
                                                                key={program.id}
                                                                value={
                                                                    program.id
                                                                }
                                                            >
                                                                {program.name}
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
                                                            e.target.value ===
                                                                ''
                                                                ? 0
                                                                : parseFloat(
                                                                      e.target
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
