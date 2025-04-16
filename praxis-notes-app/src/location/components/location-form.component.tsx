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
import { toast } from 'sonner';

type LocationFormProps = {
    onSuccess?: (newLocationId: string) => void;
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
        onSuccess: (result) => {
            form.reset();
            if (!result.error) {
                if (result.data.locationId) {
                    toast.success('Location created successfully');
                    onSuccess?.(result.data.locationId);
                } else {
                    toast.error('Location created, but ID was missing.');
                    console.error(
                        'Create location success, but missing ID:',
                        result,
                    );
                }
            } else {
                const errorMessage =
                    result.error === 'DUPLICATE'
                        ? 'Location with this name already exists.'
                        : 'Failed to create location.';
                toast.error(errorMessage);
                if (result.error !== 'DUPLICATE') {
                    console.error('Create location error:', result.error);
                }
            }
        },
        onError: (error) => {
            toast.error('An unexpected error occurred.');
            console.error('Create location network/unexpected error:', error);
        },
    });

    const handleFormSubmit = (data: z.infer<typeof createLocationSchema>) => {
        console.log('-->   ~ handleFormSubmit ~ data:', data);
        createLocation.mutate(data);
    };

    return (
        <FormProvider {...form}>
            <form
                onSubmit={(e) => {
                    console.log('-->   ~ onSubmit ~ e:', e);
                    e.preventDefault();
                    handleFormSubmit(form.getValues());
                }}
                className="space-y-4"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <div>
                            <Input
                                placeholder="Enter location name"
                                {...field}
                            />
                        </div>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <div>
                            <Textarea
                                placeholder="Enter location description (optional)"
                                rows={3}
                                {...field}
                                value={field.value ?? ''}
                            />
                        </div>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <div>
                            <Textarea
                                placeholder="Enter location address (optional)"
                                rows={3}
                                {...field}
                                value={field.value ?? ''}
                            />
                        </div>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={createLocation.isPending}>
                        {createLocation.isPending
                            ? 'Creating...'
                            : 'Create Location'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};
