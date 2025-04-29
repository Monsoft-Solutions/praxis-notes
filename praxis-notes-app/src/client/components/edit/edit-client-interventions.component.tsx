import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect } from 'react';

import { Button } from '@ui/button.ui';

import { api, apiClientUtils } from '@api/providers/web';

import { EditClientInterventionsForm } from './edit-client-interventions-form.component';
import { clientFormInterventionSchema } from '../../schemas/client-form-intervention.schema';
import { Form } from '@shared/ui/form.ui';

// Define the schema for a single intervention
const editClientInterventionSchema = clientFormInterventionSchema.extend({
    showSelector: z.boolean().default(false),
});

// Define the schema for the form
const interventionsFormSchema = z.object({
    interventions: z.array(editClientInterventionSchema),
});

// Export the type
export type InterventionsFormData = z.infer<typeof interventionsFormSchema>;

type EditClientInterventionsProps = {
    clientId: string;
    onSaved?: () => void;
};

export const EditClientInterventions = ({
    clientId,
    onSaved,
}: EditClientInterventionsProps) => {
    const {
        data: interventionsQueryData,
        isLoading: isLoadingInterventions,
        isSuccess: isSuccessInterventions,
        isError: isErrorInterventions,
        error: errorInterventions,
    } = api.intervention.getClientInterventions.useQuery(
        { clientId },
        {
            staleTime: Infinity,
        },
    );

    const {
        data: behaviorsQueryData,
        isLoading: isLoadingBehaviors,
        isSuccess: isSuccessBehaviors,
        isError: isErrorBehaviors,
        error: errorBehaviors,
    } = api.behavior.getClientBehaviors.useQuery(
        { clientId },
        {
            staleTime: Infinity,
        },
    );

    const {
        data: allInterventionsQueryData,
        isLoading: isLoadingAllInterventions,
        isSuccess: isSuccessAllInterventions,
        isError: isErrorAllInterventions,
        error: errorAllInterventions,
    } = api.intervention.getInterventions.useQuery(undefined, {
        staleTime: Infinity,
    });

    const updateInterventionsMutation =
        api.client.updateClientInterventions.useMutation({
            onSuccess: async () => {
                toast.success('Interventions updated');
                // Invalidate query to refetch updated data
                await apiClientUtils.intervention.getClientInterventions.invalidate(
                    {
                        clientId,
                    },
                );
                // Reset form dirty state after successful save and refetch
                form.reset(form.getValues());
                if (onSaved) onSaved();
            },
            onError: (error) => {
                console.error('Failed to update interventions:', error);
                toast.error('Failed to update interventions');
            },
        });

    const form = useForm<InterventionsFormData>({
        resolver: zodResolver(interventionsFormSchema),
        defaultValues: {
            interventions: [],
        },
    });

    // Update form when data is fetched
    useEffect(() => {
        if (interventionsQueryData && 'data' in interventionsQueryData) {
            const initialInterventions = interventionsQueryData.data.map(
                (intervention) => ({
                    id: intervention.id,
                    behaviorIds: intervention.behaviors,
                    showSelector: false,
                }),
            );

            // Reset the form with fetched data, preserving dirty state if any changes were made before fetch completed
            form.reset(
                { interventions: initialInterventions },
                { keepDirtyValues: true, keepTouched: true },
            );
        }
    }, [interventionsQueryData, form]);

    // Non-async onSubmit as mutate handles async logic
    const onSubmit = (data: InterventionsFormData) => {
        updateInterventionsMutation.mutate({
            clientId,
            interventions: data.interventions,
        });
    };

    if (
        isLoadingInterventions ||
        isLoadingBehaviors ||
        isLoadingAllInterventions
    ) {
        return <div>Loading interventions...</div>;
    }

    if (isErrorInterventions) {
        console.error(
            'Error fetching client interventions:',
            errorInterventions,
        );
        return <div>Error loading client interventions. Please try again.</div>;
    }

    if (isErrorBehaviors) {
        console.error('Error loading client behaviors:', errorBehaviors);
        return <div>Error loading client behaviors.</div>;
    }

    if (isErrorAllInterventions) {
        console.error(
            'Error loading all interventions:',
            errorAllInterventions,
        );
        return <div>Error loading all interventions.</div>;
    }

    // Ensure all queries were successful before proceeding
    if (
        !isSuccessInterventions ||
        !isSuccessBehaviors ||
        !isSuccessAllInterventions
    ) {
        return <div>Waiting for data...</div>;
    }

    // All queries are successful at this point, we can safely access data
    const existingBehaviors =
        'data' in behaviorsQueryData ? behaviorsQueryData.data : [];

    const existingInterventions =
        'data' in allInterventionsQueryData
            ? allInterventionsQueryData.data
            : [];

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-6"
            >
                <EditClientInterventionsForm
                    existingBehaviors={existingBehaviors}
                    existingInterventions={existingInterventions}
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={
                            updateInterventionsMutation.isPending ||
                            !form.formState.isDirty // Disable if not dirty
                        }
                    >
                        {updateInterventionsMutation.isPending
                            ? 'Saving...'
                            : 'Save Interventions'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
