import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEffect } from 'react';

import { Button } from '@ui/button.ui';

import { api, apiClientUtils } from '@api/providers/web';

import { clientFormReplacementProgramSchema } from '../../schemas/client-form-replacement-program.schema';
import { EditClientReplacementProgramsForm } from './edit-client-replacement-programs-form.component';
import { ReplacementProgram } from '@src/replacement-program/schemas';
import { Behavior } from '@src/behavior/schemas';
import { Form } from '@shared/ui/form.ui';

const editClientReplacementProgramSchema =
    clientFormReplacementProgramSchema.extend({
        showSelector: z.boolean(),
    });

// Define the schema for the form
const replacementProgramsFormSchema = z.object({
    replacementPrograms: z.array(editClientReplacementProgramSchema),
});

// Export the type
export type ReplacementProgramsFormData = z.infer<
    typeof replacementProgramsFormSchema
>;

type EditClientReplacementProgramsProps = {
    clientId: string;
    onSaved?: () => void;
};

export const EditClientReplacementPrograms = ({
    clientId,
    onSaved,
}: EditClientReplacementProgramsProps) => {
    const {
        data: clientReplacementProgramsQueryData,
        isLoading: isLoadingReplacementPrograms,
        isSuccess: isSuccessReplacementPrograms,
        isError: isErrorReplacementPrograms,
        error: errorReplacementPrograms,
    } = api.client.getClientReplacementPrograms.useQuery(
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
        data: allReplacementProgramsQueryData,
        isLoading: isLoadingAllReplacementPrograms,
        isSuccess: isSuccessAllReplacementPrograms,
        isError: isErrorAllReplacementPrograms,
        error: errorAllReplacementPrograms,
    } = api.replacementProgram.getReplacementPrograms.useQuery(undefined, {
        staleTime: Infinity,
    });

    const updateReplacementProgramsMutation =
        api.client.updateClientReplacementPrograms.useMutation({
            onSuccess: async () => {
                toast.success('Replacement programs updated');
                // Invalidate query to refetch updated data
                await apiClientUtils.client.getClientReplacementPrograms.invalidate(
                    {
                        clientId,
                    },
                );
                // Reset form dirty state after successful save and refetch
                form.reset(form.getValues());
                if (onSaved) onSaved();
            },
            onError: (error) => {
                console.error('Failed to update replacement programs:', error);
                toast.error('Failed to update replacement programs');
            },
        });

    const form = useForm<ReplacementProgramsFormData>({
        resolver: zodResolver(replacementProgramsFormSchema),
        defaultValues: {
            replacementPrograms: [],
        },
    });

    // Update form when data is fetched
    useEffect(() => {
        if (clientReplacementProgramsQueryData?.data) {
            const initialReplacementPrograms =
                clientReplacementProgramsQueryData.data.map((program) => ({
                    id: program.id,
                    behaviorIds: program.behaviorIds,
                }));
            // Reset the form with fetched data, preserving dirty state if any changes were made before fetch completed
            form.reset(
                { replacementPrograms: initialReplacementPrograms },
                { keepDirty: true },
            );
        }
    }, [clientReplacementProgramsQueryData, form]);

    // Non-async onSubmit as mutate handles async logic
    const onSubmit = (data: ReplacementProgramsFormData) => {
        updateReplacementProgramsMutation.mutate({
            clientId,
            replacementPrograms: data.replacementPrograms,
        });
    };

    if (
        isLoadingReplacementPrograms ||
        isLoadingBehaviors ||
        isLoadingAllReplacementPrograms
    ) {
        return <div>Loading replacement programs...</div>;
    }

    if (isErrorReplacementPrograms) {
        console.error(
            'Error fetching client replacement programs:',
            errorReplacementPrograms,
        );
        return (
            <div>
                Error loading client replacement programs. Please try again.
            </div>
        );
    }

    if (isErrorBehaviors) {
        console.error('Error loading client behaviors:', errorBehaviors);
        return <div>Error loading client behaviors.</div>;
    }

    if (isErrorAllReplacementPrograms) {
        console.error(
            'Error loading all replacement programs:',
            errorAllReplacementPrograms,
        );
        return <div>Error loading available replacement programs.</div>;
    }

    // Ensure all queries were successful before proceeding
    if (
        !isSuccessReplacementPrograms ||
        !isSuccessBehaviors ||
        !isSuccessAllReplacementPrograms
    ) {
        return <div>Waiting for data...</div>;
    }

    // All queries are successful at this point, we can safely access data
    const existingBehaviors =
        'data' in behaviorsQueryData ? behaviorsQueryData.data : [];
    const existingPrograms =
        'data' in allReplacementProgramsQueryData
            ? allReplacementProgramsQueryData.data
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
                <EditClientReplacementProgramsForm
                    existingPrograms={
                        existingPrograms as unknown as ReplacementProgram[]
                    }
                    existingBehaviors={
                        existingBehaviors as unknown as Behavior[]
                    }
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={
                            updateReplacementProgramsMutation.isPending ||
                            !form.formState.isDirty // Disable if not dirty
                        }
                    >
                        {updateReplacementProgramsMutation.isPending
                            ? 'Saving...'
                            : 'Save Programs'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
