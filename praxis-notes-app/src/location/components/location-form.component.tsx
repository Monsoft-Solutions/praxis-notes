import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@shared/ui/button.ui';
import { Input } from '@shared/ui/input.ui';

import { api } from '@api/providers/web';

import { createLocationSchema } from '../schemas';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@shared/ui/form.ui';
import { Textarea } from '@shared/ui/textarea.ui';

type LocationFormProps = {
    onSuccess?: () => void;
};

export const LocationForm: React.FC<LocationFormProps> = ({ onSuccess }) => {
    const form = useForm<z.infer<typeof createLocationSchema>>({
        resolver: zodResolver(createLocationSchema),
        defaultValues: {
            name: '',
            description: '',
            address: '',
        },
    });

    const createLocation = api.location.createLocation.useMutation({
        onSuccess: () => {
            form.reset();
            onSuccess?.();
        },
    });

    const onSubmit = form.handleSubmit((data) => {
        createLocation.mutate(data);
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={() => onSubmit} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <Input placeholder="Enter location name" {...field} />
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <Textarea
                            placeholder="Enter location description"
                            rows={3}
                            {...field}
                            value={field.value ?? ''}
                        />
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <Textarea
                            placeholder="Enter location address (optional)"
                            rows={3}
                            {...field}
                            value={field.value ?? ''}
                        />
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={createLocation.isPending}>
                        {createLocation.isPending
                            ? 'Adding...'
                            : 'Add Location'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};
