import { useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { Trash2 } from 'lucide-react';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ui/form.ui';

import { ClientSessionForm } from '../schemas';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';

import { api, apiClientUtils } from '@api/providers/web';
import { AbcSelector } from './abc-selector.component';

import { abcFunctionEnum } from '../enum';

import { Card, CardTitle, CardHeader, CardContent } from '@shared/ui/card.ui';

type ABCCardProps = {
    index: number;
    clientId: string;
    onRemove?: () => void;
};

export function ABCCard({ index, clientId, onRemove }: ABCCardProps) {
    const { control } = useFormContext<ClientSessionForm>();

    const { data: antecedentsQuery } = api.antecedent.getAntecedents.useQuery();
    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();
    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    const { data: clientBehaviorsQuery } =
        api.behavior.getClientBehaviors.useQuery({ clientId });
    const { data: clientInterventionsQuery } =
        api.intervention.getClientInterventions.useQuery({ clientId });

    const { mutateAsync: createAntecedent } =
        api.antecedent.createAntecedent.useMutation();
    const { mutateAsync: createBehavior } =
        api.behavior.createBehavior.useMutation();
    const { mutateAsync: createIntervention } =
        api.intervention.createIntervention.useMutation();

    if (!antecedentsQuery) return null;
    const { error: antecedentsError } = antecedentsQuery;
    if (antecedentsError) return null;
    const { data: antecedents } = antecedentsQuery;

    if (!behaviorsQuery) return null;
    const { error: behaviorsError } = behaviorsQuery;
    if (behaviorsError) return null;
    const { data: rawBehaviors } = behaviorsQuery;

    if (!interventionsQuery) return null;
    const { error: interventionsError } = interventionsQuery;
    if (interventionsError) return null;
    const { data: rawInterventions } = interventionsQuery;

    if (!clientBehaviorsQuery) return null;
    const { error: clientBehaviorsError } = clientBehaviorsQuery;
    if (clientBehaviorsError) return null;
    const { data: clientBehaviors } = clientBehaviorsQuery;

    if (!clientInterventionsQuery) return null;
    const { error: clientInterventionsError } = clientInterventionsQuery;
    if (clientInterventionsError) return null;
    const { data: clientInterventions } = clientInterventionsQuery;

    const behaviors = rawBehaviors.map((behavior) => ({
        ...behavior,
        isClient: clientBehaviors.some((b) => b.id === behavior.id),
    }));

    const interventions = rawInterventions.map((intervention) => ({
        ...intervention,
        isClient: clientInterventions.some((i) => i.id === intervention.id),
    }));

    return (
        <Card className="relative border-b pb-8 pt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ABC {index + 1}</CardTitle>

                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={onRemove}
                        type="button"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove ABC Entry</span>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="mt-4 space-y-6">
                {/* Activity/Antecedent */}
                <FormField
                    control={control}
                    name={`abcIdEntries.${index}.antecedentId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Activity/Antecedent</FormLabel>

                            <AbcSelector
                                initValue={field.value}
                                placeholder="Select activity/antecedent"
                                items={antecedents}
                                onSelect={field.onChange}
                                create={async ({ name }) => {
                                    const result = await createAntecedent({
                                        name,
                                    });
                                    if (result.error) return null;
                                    await apiClientUtils.antecedent.getAntecedents.invalidate();
                                    return result.data;
                                }}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Function */}
                <FormField
                    control={control}
                    name={`abcIdEntries.${index}.function`}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Function</FormLabel>

                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select function" />
                                    </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                    {abcFunctionEnum.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Behaviors */}
                <FormField
                    control={control}
                    name={`abcIdEntries.${index}.behaviorIds`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maladaptive Behaviors</FormLabel>

                            <AbcSelector
                                initValue={field.value}
                                placeholder="Select behavior"
                                multiple
                                items={behaviors}
                                onSelect={field.onChange}
                                create={async ({ name }) => {
                                    const result = await createBehavior({
                                        name,
                                        description: '',
                                    });
                                    if (result.error) return null;
                                    await apiClientUtils.behavior.getBehaviors.invalidate();
                                    return result.data;
                                }}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Interventions */}
                <FormField
                    control={control}
                    name={`abcIdEntries.${index}.interventionIds`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interventions</FormLabel>

                            <AbcSelector
                                initValue={field.value}
                                placeholder="Select intervention"
                                multiple
                                items={interventions}
                                onSelect={field.onChange}
                                create={async ({ name }) => {
                                    const result = await createIntervention({
                                        name,
                                        description: '',
                                    });
                                    if (result.error) return null;
                                    await apiClientUtils.intervention.getInterventions.invalidate();
                                    return result.data;
                                }}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
