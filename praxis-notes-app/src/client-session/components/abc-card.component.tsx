import { useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { Trash2 } from 'lucide-react';

import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { cn } from '@css/utils';

import { ClientSession } from '../schemas';

import { api } from '@api/providers/web';
import { AbcSelector } from './abc-selector.component';

type ABCCardProps = {
    index: number;
    onRemove?: () => void;
};

export function ABCCard({ index, onRemove }: ABCCardProps) {
    const { control } = useFormContext<ClientSession>();

    const { data: antecedentsQuery } = api.antecedent.getAntecedents.useQuery();
    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();
    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    if (!antecedentsQuery) return null;
    const { error: antecedentsError } = antecedentsQuery;
    if (antecedentsError) return null;
    const { data: antecedents } = antecedentsQuery;

    if (!behaviorsQuery) return null;
    const { error: behaviorsError } = behaviorsQuery;
    if (behaviorsError) return null;
    const { data: behaviors } = behaviorsQuery;

    if (!interventionsQuery) return null;
    const { error: interventionsError } = interventionsQuery;
    if (interventionsError) return null;
    const { data: interventions } = interventionsQuery;

    return (
        <Card className={cn('relative', index > 0 && 'mt-8')}>
            {onRemove && (
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={onRemove}
                    type="button"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove ABC Entry</span>
                </Button>
            )}

            <CardHeader>
                <CardTitle className="text-lg">
                    ABC Entry #{index + 1}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Activity/Antecedent */}
                <FormField
                    control={control}
                    name={`abcEntries.${index}.antecedent`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Activity/Antecedent</FormLabel>

                            <AbcSelector
                                items={antecedents}
                                onSelect={field.onChange}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Behaviors */}
                <FormField
                    control={control}
                    name={`abcEntries.${index}.behavior`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Behaviors</FormLabel>

                            <AbcSelector
                                items={behaviors}
                                onSelect={field.onChange}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Interventions */}
                <FormField
                    control={control}
                    name={`abcEntries.${index}.intervention`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interventions</FormLabel>

                            <AbcSelector
                                items={interventions}
                                onSelect={field.onChange}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
