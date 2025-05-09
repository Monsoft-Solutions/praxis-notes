import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormMessage } from '@ui/form.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { ClientSessionForm } from '../schemas';

import { TooltipContent, TooltipTrigger } from '@shared/ui/tooltip.ui';
import { InfoIcon } from 'lucide-react';
import { TooltipProvider, Tooltip } from '@shared/ui/tooltip.ui';
import { api, apiClientUtils } from '@api/providers/web';
import { AbcSelector } from './abc-selector.component';

export function ReinforcerSelector() {
    const { control } = useFormContext<ClientSessionForm>();

    const { data: reinforcersQuery } =
        api.reinforcerApi.getReinforcers.useQuery();
    const { mutateAsync: createReinforcer } =
        api.reinforcerApi.createReinforcer.useMutation();

    if (!reinforcersQuery) return null;
    const { error: reinforcersError } = reinforcersQuery;
    if (reinforcersError) return null;
    const { data: reinforcers } = reinforcersQuery;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Session Reinforcers</CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Select the reinforcers used in this session.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent className="mt-4">
                <FormField
                    control={control}
                    name="reinforcerIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reinforcers</FormLabel>

                            <AbcSelector
                                initValue={field.value}
                                placeholder="Select reinforcers"
                                multiple
                                items={reinforcers}
                                onSelect={field.onChange}
                                create={async ({ name }) => {
                                    const result = await createReinforcer({
                                        name,
                                    });
                                    if (result.error) return null;
                                    await apiClientUtils.reinforcerApi.getReinforcers.invalidate();
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
