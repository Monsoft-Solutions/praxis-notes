import { useFieldArray, useFormContext } from 'react-hook-form';

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

import { Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { ClientForm } from '../schemas';

import { Behavior } from '@src/behavior/schemas';
import { clientBehaviorTypeEnum } from '@src/behavior/enums';

export function ClientBehaviorsForm({
    existingBehaviors,
}: {
    existingBehaviors: Behavior[];
}) {
    const { control } = useFormContext<ClientForm>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'behaviors',
    });

    const addBehavior = ({ id }: { id: string }) => {
        append({
            id,
            baseline: 0,
            type: 'frequency',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Client Behaviors</h3>
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
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Behavior {index + 1}
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

                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select behavior" />
                                                        </SelectTrigger>
                                                    </FormControl>

                                                    <SelectContent>
                                                        {existingBehaviors.map(
                                                            (behavior) => (
                                                                <SelectItem
                                                                    key={
                                                                        behavior.id
                                                                    }
                                                                    value={
                                                                        behavior.id
                                                                    }
                                                                >
                                                                    {
                                                                        behavior.name
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

                                    <FormField
                                        control={control}
                                        name={`behaviors.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>
                                                    Type{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>

                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
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
                                                                    key={type}
                                                                    value={type}
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
