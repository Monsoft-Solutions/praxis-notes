import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormControl, FormMessage } from '@ui/form.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { ClientSessionForm } from '../schemas';

import { Textarea } from '@ui/textarea.ui';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { InfoIcon } from 'lucide-react';
import {
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@shared/ui/tooltip.ui';
import { Tooltip } from '@shared/ui/tooltip.ui';

const sessionObservationsId: TourStepId = 'session-form-observations';

export function SessionObservations() {
    const { control } = useFormContext<ClientSessionForm>();

    return (
        <Card id={sessionObservationsId}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Observations</CardTitle>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <InfoIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Describe any general observations about the session.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>

            <CardContent className="mt-4">
                <FormField
                    control={control}
                    name="observations"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Observations"
                                    className="resize-none"
                                    value={field.value ?? ''}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
