import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@ui/button.ui';
// Form from @ui/form.ui is not needed here as we use a standard form element

import { api, apiClientUtils } from '@api/providers/web';
// Behavior import removed as it was unused
// import { Behavior } from '@src/behavior/schemas';
// ClientForm is not needed directly, BehaviorsFormData is used
import {
    clientFormBehaviorSchema,
    ClientFormBehavior,
} from '../schemas/client-form-behavior.schema'; // Corrected import name
import { EditClientBehaviorsForm } from './edit-client-behaviors-form.component';
import { Form } from '@shared/ui/form.ui';

// Define the Zod schema for the array of behaviors directly
const behaviorsFormSchema = z.object({
    behaviors: z.array(clientFormBehaviorSchema),
});

// Export the type
export type BehaviorsFormData = z.infer<typeof behaviorsFormSchema>;

// Define the expected type for the fetched client behaviors data
type FetchedClientBehavior = {
    behaviorId: string;
    type: 'frequency' | 'percentage'; // Adjust enum based on actual API response
    baseline: number;
};

type EditClientBehaviorsProps = {
    clientId: string;
    onSaved?: () => void;
};

export const EditClientBehaviors = ({
    clientId,
    onSaved,
}: EditClientBehaviorsProps) => {
    const {
        data: clientBehaviorsQueryData, // Renamed for clarity
        isLoading: isLoadingClientBehaviors,
        isSuccess: isSuccessClientBehaviors,
        isError: isErrorClientBehaviors,
        error: errorClientBehaviors,
    } = api.client.getClientBehaviors.useQuery(
        { clientId },
        {
            staleTime: Infinity,
        },
    );

    const {
        data: allBehaviorsQueryData, // Renamed for clarity
        isLoading: isLoadingAllBehaviors,
        isSuccess: isSuccessAllBehaviors,
        isError: isErrorAllBehaviors,
        error: errorAllBehaviors,
    } = api.behavior.getBehaviors.useQuery(undefined, {
        staleTime: Infinity,
    });

    const updateBehaviorsMutation =
        api.client.updateClientBehaviors.useMutation({
            onSuccess: async () => {
                toast.success('Client behaviors updated');
                // Invalidate query to refetch updated data
                await apiClientUtils.client.getClientBehaviors.invalidate({
                    clientId,
                });
                // Reset form dirty state after successful save and refetch
                form.reset(form.getValues());
                if (onSaved) onSaved();
            },
            onError: (error) => {
                console.error('Failed to update client behaviors:', error);
                toast.error('Failed to update client behaviors');
            },
        });

    const form = useForm<BehaviorsFormData>({
        resolver: zodResolver(behaviorsFormSchema),
        defaultValues: {
            behaviors: [],
        },
    });

    useEffect(() => {
        // Only reset form if the query was successful
        if (isSuccessClientBehaviors) {
            const fetchedData =
                clientBehaviorsQueryData.data as FetchedClientBehavior[];
            const initialBehaviors: ClientFormBehavior[] = fetchedData.map(
                (b) => ({
                    id: b.behaviorId,
                    type: b.type,
                    baseline: b.baseline,
                    isExisting: true, // Set the flag for existing behaviors
                }),
            );
            // Reset the form with fetched data, preserving dirty state if any changes were made before fetch completed
            form.reset({ behaviors: initialBehaviors }, { keepDirty: true });
        }
        // Error handling is done below in the component render logic
    }, [isSuccessClientBehaviors, clientBehaviorsQueryData, form]); // Use the query data object as dependency

    // Non-async onSubmit as mutate handles async logic
    const onSubmit = (data: BehaviorsFormData) => {
        updateBehaviorsMutation.mutate({
            clientId,
            behaviors: data.behaviors,
        });
    };

    if (isLoadingClientBehaviors || isLoadingAllBehaviors) {
        return <div>Loading behaviors...</div>;
    }

    if (isErrorClientBehaviors) {
        console.error('Error fetching client behaviors:', errorClientBehaviors);
        return <div>Error loading client behaviors. Please try again.</div>;
    }

    if (isErrorAllBehaviors) {
        console.error('Error loading all behaviors:', errorAllBehaviors);
        return <div>Error loading available behaviors.</div>;
    }

    // Ensure both queries were successful before proceeding
    if (!isSuccessClientBehaviors || !isSuccessAllBehaviors) {
        // This should ideally not happen if loading/error states are handled,
        // but it acts as a safeguard before accessing data.
        return <div>Waiting for data...</div>; // Or some other placeholder
    }

    // We know data exists if no loading/error states are active and queries were successful
    const allBehaviors = !allBehaviorsQueryData.error
        ? allBehaviorsQueryData.data
        : []; // Access data safely

    return (
        <Form {...form}>
            {/* The form submits via the button, no need for promise handling here */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-6"
            >
                <EditClientBehaviorsForm allBehaviors={allBehaviors} />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={
                            updateBehaviorsMutation.isPending ||
                            !form.formState.isDirty // Disable if not dirty
                        }
                    >
                        {updateBehaviorsMutation.isPending
                            ? 'Saving...'
                            : 'Save Behaviors'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
