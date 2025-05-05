import { useEffect, useCallback, useState } from 'react';

import { z } from 'zod';

import { useBlocker } from '@tanstack/react-router';

import { useForm, FormProvider } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';

import {
    MultiStepForm,
    MultiStepFormStep,
} from '@shared/components/multi-step-form.component';

import { clientFormSchema, ClientForm as ClientFormType } from '../schemas';

import { ClientBasicInfoForm } from './client-basic-info-form.component';
import { ClientBehaviorsForm } from './client-behaviors-form.component';
import { ClientReplacementProgramsForm } from './client-replacement-programs-form.component';
import { ClientInterventionsForm } from './client-interventions-form.component';

import { ClientReviewSummary } from './client-review-summary.component';

import { api, apiClientUtils } from '@api/providers/web';

import { Route } from '@routes/_private/_app/clients/new';

import { trackEvent } from '@analytics/providers';

const defaultInitialData: Omit<ClientFormType, 'currentStep' | 'isComplete'> = {
    firstName: '',
    lastName: '',
    gender: 'male',
    notes: '',
    behaviors: [],
    replacementPrograms: [],
    interventions: [],
};

export function ClientForm({
    initialData,
    draftId,
}:
    | {
          draftId: string;
          initialData: Omit<ClientFormType, 'currentStep' | 'isComplete'>;
      }
    | {
          draftId?: undefined;
          initialData?: Omit<ClientFormType, 'currentStep' | 'isComplete'>;
      }) {
    const navigate = Route.useNavigate();

    const { mutateAsync: createClient } = api.client.createClient.useMutation();
    const { mutateAsync: updateClient } = api.client.updateClient.useMutation();

    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();
    const { data: replacementProgramsQuery } =
        api.replacementProgram.getReplacementPrograms.useQuery();
    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ClientFormType>({
        resolver: zodResolver(clientFormSchema),
        mode: 'onChange',

        defaultValues: {
            ...(initialData ?? defaultInitialData),
            currentStep: 1,
            isComplete: false,
        },

        shouldUnregister: false,
    });

    const currentStep = form.watch('currentStep');

    const handleSave = useCallback(
        async ({
            isDraft = false,
            hideToast = false,
        }: {
            isDraft?: boolean;
            hideToast?: boolean;
        }) => {
            setIsSaving(true);

            const formData = form.getValues();

            if (draftId) {
                await updateClient({
                    clientId: draftId,
                    ...formData,
                    isDraft,
                });
            } else {
                await createClient({
                    ...formData,
                    isDraft,
                });
            }

            if (isDraft) {
                if (!hideToast) toast.success('Client saved as draft');
            } else {
                toast.success('Client saved');

                await navigate({
                    to: '/clients',
                });
            }

            await apiClientUtils.client.getClients.invalidate();

            trackEvent('client', 'client_save');

            setIsSaving(false);
        },
        [form, createClient, navigate, draftId, updateClient],
    );

    const handleAutoSave = useCallback(async () => {
        await handleSave({ isDraft: true, hideToast: true });
    }, [handleSave]);

    const handleStepChange = useCallback(
        async (step: number) => {
            await handleAutoSave();

            // If going backwards, always allow it
            if (step < currentStep) {
                form.setValue('currentStep', step);
                return;
            }

            // If trying to go to a next step, validate the current step first
            if (step > currentStep) {
                // Different validation for each step
                if (currentStep === 1) {
                    // Manually validate required fields
                    const firstName = form.getValues('firstName');
                    const lastName = form.getValues('lastName');

                    if (!firstName || firstName.trim() === '') {
                        form.setError('firstName', {
                            type: 'manual',
                            message: 'First name is required',
                        });

                        return;
                    }

                    if (!lastName || lastName.trim() === '') {
                        form.setError('lastName', {
                            type: 'manual',
                            message: 'Last name is required',
                        });
                        return;
                    }
                }
            }

            // If validation passes or going back, update the step
            form.setValue('currentStep', step);

            // Clear validation errors when moving to new step
            form.clearErrors();
        },
        [form, currentStep, handleAutoSave],
    );

    useBlocker({
        blockerFn: () => {
            if (isSaving) return true;

            void form.handleSubmit(
                () =>
                    handleSave({
                        isDraft: true,
                    }),
                () => {
                    toast.error('Client was discarded');
                },
            )();
            return true;
        },
    });

    useEffect(() => {
        const handler = (e: Event) => {
            const event = e as CustomEvent;

            const eventParsing = z
                .object({ step: z.number() })
                .safeParse(event.detail);

            if (eventParsing.success) {
                const { step } = eventParsing.data;

                void handleStepChange(step);
            }
        };

        window.addEventListener('clientFormStepChange', handler);

        return () => {
            window.removeEventListener('clientFormStepChange', handler);
        };
    }, [handleStepChange]);

    useEffect(() => {
        const handler = () => {
            void handleSave({});
        };

        window.addEventListener('clientFormSubmit', handler);

        return () => {
            window.removeEventListener('clientFormSubmit', handler);
        };
    }, [handleSave]);

    if (!behaviorsQuery) return null;
    const { error: behaviorsError } = behaviorsQuery;
    if (behaviorsError) return null;
    const { data: behaviors } = behaviorsQuery;

    if (!replacementProgramsQuery) return null;
    const { error: replacementProgramsError } = replacementProgramsQuery;
    if (replacementProgramsError) return null;
    const { data: replacementPrograms } = replacementProgramsQuery;

    if (!interventionsQuery) return null;
    const { error: interventionsError } = interventionsQuery;
    if (interventionsError) return null;
    const { data: interventions } = interventionsQuery;

    const steps: MultiStepFormStep[] = [
        {
            title: 'Basic Info',
            description: "Add client's basic information",
            content: <ClientBasicInfoForm />,
        },

        {
            title: 'Behaviors',
            description: 'Add behaviors for this client',
            content: <ClientBehaviorsForm existingBehaviors={behaviors} />,
        },

        {
            title: 'Programs',
            description: 'Add replacement programs',
            content: (
                <ClientReplacementProgramsForm
                    existingPrograms={replacementPrograms}
                    existingBehaviors={behaviors}
                />
            ),
        },

        {
            title: 'Interventions',
            description: 'Add interventions',
            content: (
                <ClientInterventionsForm
                    existingInterventions={interventions}
                    existingBehaviors={behaviors}
                />
            ),
        },
        {
            title: 'Review',
            description:
                'Please review all client information before submitting',
            content: (
                <ClientReviewSummary
                    existingBehaviors={behaviors}
                    existingReplacementPrograms={replacementPrograms}
                    existingInterventions={interventions}
                />
            ),
        },
    ];

    // Determine if the last step submission should be enabled
    const isLastStepSubmitEnabled = form.formState.isValid;

    return (
        <FormProvider {...form}>
            <div className="space-y-8">
                <MultiStepForm
                    steps={steps}
                    currentStep={currentStep}
                    onStepChange={(step) => void handleStepChange(step)}
                    onComplete={() => void handleSave({})}
                    isLastStepSubmitEnabled={isLastStepSubmitEnabled}
                />
            </div>
        </FormProvider>
    );
}
