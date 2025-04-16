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

import { api } from '@api/providers/web';

import { Route } from '@routes/_private/_app/clients/new';

export function ClientForm() {
    const navigate = Route.useNavigate();

    const { mutateAsync: createClient } =
        api.clientRouter.createClient.useMutation();

    const { data: behaviorsQuery } = api.behavior.getBehaviors.useQuery();
    const { data: replacementProgramsQuery } =
        api.replacementProgram.getReplacementPrograms.useQuery();
    const { data: interventionsQuery } =
        api.intervention.getInterventions.useQuery();

    const form = useForm<ClientFormType>({
        resolver: zodResolver(clientFormSchema),
        mode: 'onChange',

        defaultValues: {
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

    const currentStep = form.watch('currentStep');

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
            description: 'Review all information',
            content: (
                <ClientReviewSummary
                    existingBehaviors={behaviors}
                    existingReplacementPrograms={replacementPrograms}
                    existingInterventions={interventions}
                />
            ),
        },
    ];

    const handleStepChange = (step: number) => {
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

                    console.log('First name validation failed');
                    return;
                }

                if (!lastName || lastName.trim() === '') {
                    form.setError('lastName', {
                        type: 'manual',
                        message: 'Last name is required',
                    });
                    console.log('Last name validation failed');
                    return;
                }
            }
        }

        // If validation passes or going back, update the step
        form.setValue('currentStep', step);

        // Clear validation errors when moving to new step
        form.clearErrors();
    };

    const handleComplete = () => {
        const formData = form.getValues();

        void createClient(formData);

        void navigate({
            to: '/clients',
        });
    };

    // Determine if the last step submission should be enabled
    const isLastStepSubmitEnabled = form.formState.isValid;

    return (
        <FormProvider {...form}>
            <div className="space-y-8">
                <MultiStepForm
                    steps={steps}
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    onComplete={handleComplete}
                    isLastStepSubmitEnabled={isLastStepSubmitEnabled}
                />
            </div>
        </FormProvider>
    );
}
