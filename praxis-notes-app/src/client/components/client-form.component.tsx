import { useForm, FormProvider } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

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
import { useEffect, useCallback } from 'react';
import { z } from 'zod';

import { trackEvent } from '@analytics/providers';

export function ClientForm({ isTour }: { isTour?: boolean }) {
    const navigate = Route.useNavigate();

    const { mutateAsync: createClient } = api.client.createClient.useMutation();

    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();
    const { data: replacementProgramsQuery } =
        api.replacementProgram.getReplacementPrograms.useQuery();
    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    const form = useForm<ClientFormType>({
        resolver: zodResolver(clientFormSchema),
        mode: 'onChange',

        defaultValues: isTour
            ? {
                  firstName: 'John',
                  lastName: 'Doe',
                  gender: 'male',
                  notes: 'This is a test client',
                  behaviors: [
                      {
                          id: 'behavior-1                          ',
                          type: 'frequency',
                          baseline: 1,
                      },
                  ],
                  replacementPrograms: [
                      {
                          id: 'replacement-program-3               ',
                          behaviorIds: ['behavior-1                          '],
                      },
                  ],
                  interventions: [
                      {
                          id: 'intervention-1                      ',
                          behaviorIds: ['behavior-1                          '],
                      },
                  ],
                  currentStep: 1,
                  isComplete: false,
              }
            : {
                  firstName: '',
                  lastName: '',
                  gender: 'male',
                  notes: '',
                  behaviors: [],
                  replacementPrograms: [],
                  interventions: [],
                  currentStep: 1,
                  isComplete: false,
              },

        shouldUnregister: false,
    });

    const currentStep = form.watch('currentStep');

    const handleStepChange = useCallback(
        (step: number) => {
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
        [form, currentStep],
    );

    const handleComplete = useCallback(async () => {
        const formData = form.getValues();

        await createClient(formData);

        trackEvent('client', 'client_save');

        await apiClientUtils.client.getClients.invalidate();

        await navigate({
            to: '/clients',
        });
    }, [form, createClient, navigate]);

    useEffect(() => {
        const handler = (e: Event) => {
            const event = e as CustomEvent;

            const eventParsing = z
                .object({ step: z.number() })
                .safeParse(event.detail);

            if (eventParsing.success) {
                const { step } = eventParsing.data;

                handleStepChange(step);
            }
        };

        window.addEventListener('clientFormStepChange', handler);

        return () => {
            window.removeEventListener('clientFormStepChange', handler);
        };
    }, [handleStepChange]);

    useEffect(() => {
        const handler = () => {
            void handleComplete();
        };

        window.addEventListener('clientFormSubmit', handler);

        return () => {
            window.removeEventListener('clientFormSubmit', handler);
        };
    }, [handleComplete]);

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
                    onStepChange={handleStepChange}
                    onComplete={() => void handleComplete()}
                    isLastStepSubmitEnabled={isLastStepSubmitEnabled}
                />
            </div>
        </FormProvider>
    );
}
