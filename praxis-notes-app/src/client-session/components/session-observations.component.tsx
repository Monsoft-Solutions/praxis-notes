import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormControl, FormMessage } from '@ui/form.ui';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@ui/card.ui';

import { ClientSessionForm } from '../schemas';

import { Textarea } from '@ui/textarea.ui';

export function SessionObservations() {
    const { control } = useFormContext<ClientSessionForm>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Observations</CardTitle>

                <CardDescription>
                    Describe any general observations about the session.
                </CardDescription>
            </CardHeader>

            <CardContent>
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
