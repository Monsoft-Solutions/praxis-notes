import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormControl, FormMessage } from '@ui/form.ui';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@ui/card.ui';

import { RadioGroup, RadioGroupItem } from '@ui/radio-group.ui';

import { Label } from '@ui/label.ui';

import { ClientSession } from '../schemas';

export function ValuationSelector() {
    const { control } = useFormContext<ClientSession>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Valuation</CardTitle>
                <CardDescription>
                    Rate how the overall session went.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={control}
                    name="valuation"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
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
