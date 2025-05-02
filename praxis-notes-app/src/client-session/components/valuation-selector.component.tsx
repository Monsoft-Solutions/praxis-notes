import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormControl, FormMessage } from '@ui/form.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { RadioGroup, RadioGroupItem } from '@ui/radio-group.ui';

import { Label } from '@ui/label.ui';

import { ClientSessionForm } from '../schemas';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { TooltipContent, TooltipTrigger } from '@shared/ui/tooltip.ui';
import { InfoIcon } from 'lucide-react';
import { TooltipProvider, Tooltip } from '@shared/ui/tooltip.ui';

const valuationSelectorId: TourStepId = 'session-form-valuation';

export function ValuationSelector() {
    const { control } = useFormContext<ClientSessionForm>();

    return (
        <Card id={valuationSelectorId}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Session Valuation</CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Rate how the overall session went.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent className="mt-4">
                <FormField
                    control={control}
                    name="valuation"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex w-min space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="fair"
                                            id="fair"
                                        />
                                        <Label
                                            htmlFor="fair"
                                            className="cursor-pointer"
                                        >
                                            Fair
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="good"
                                            id="good"
                                        />
                                        <Label
                                            htmlFor="good"
                                            className="cursor-pointer"
                                        >
                                            Good
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="poor"
                                            id="poor"
                                        />
                                        <Label
                                            htmlFor="poor"
                                            className="cursor-pointer"
                                        >
                                            Poor
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
