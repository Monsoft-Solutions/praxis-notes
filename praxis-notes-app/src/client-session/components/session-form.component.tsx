import { useNavigate } from '@tanstack/react-router';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm, FormProvider } from 'react-hook-form';

import { toast } from 'sonner';

import { ClientSessionForm, clientSessionFormSchema } from '../schemas';

import { Button } from '@ui/button.ui';

import { SessionHeader } from './session-header.component';

import { SessionBasicInfo } from './session-basic-info.component';
import { ABCCardContainer } from './abc-card-container.component';
import { ReplacementProgramCardContainer } from './replacement-program-card-container.component';
import { ValuationSelector } from './valuation-selector.component';
import { SessionObservations } from './session-observations.component';

import { api } from '@api/providers/web';

type SessionFormProps = {
    clientId: string;
    clientName: string;
    sessionId?: string;
    sessionStatus?: string;
};

export function SessionForm({ clientId, clientName }: SessionFormProps) {
    const { mutateAsync: createClientSession } =
        api.clientSession.createClientSession.useMutation();

    const navigate = useNavigate();

    // Initialize form with default values or initial data if provided
    const form = useForm<ClientSessionForm>({
        resolver: zodResolver(clientSessionFormSchema),

        defaultValues: {
            sessionDate: new Date(),
            startTime: '',
            endTime: '',
            location: '',
            presentParticipants: [],
            environmentalChanges: [],
            abcIdEntries: [
                {
                    antecedentId: '',
                    behaviorIds: [],
                    interventionIds: [],
                    function: 'atention',
                },
            ],
            replacementProgramEntries: [
                {
                    replacementProgramId: '',
                    teachingProcedureId: '',
                    promptingProcedureId: '',
                    clientResponse: 'expected',
                    progress: 0,
                    promptTypesIds: [],
                },
            ],
            valuation: 'good',
            observations: '',
        },
    });

    // Handle saving as draft
    const handleCreateSession = async ({
        data,
        initNotes,
    }: {
        data: ClientSessionForm;
        initNotes: boolean;
    }) => {
        const response = await createClientSession({
            clientId,
            initNotes,
            sessionForm: {
                ...data,
                sessionDate: data.sessionDate.toISOString(),
            },
        });

        if (response.error) {
            toast.error('Error saving session');
            return;
        }

        toast.success('Session saved as draft');

        const { id } = response.data;

        await navigate({
            to: '/clients/$clientId/sessions/$sessionId',
            params: { clientId, sessionId: id },
        });
    };

    // Handle cancellation
    const handleCancel = () => {
        console.log('cancelling');
    };

    return (
        <FormProvider {...form}>
            <form className="space-y-8">
                <SessionHeader clientName={clientName} />

                <SessionBasicInfo />

                <ABCCardContainer />

                <ReplacementProgramCardContainer />

                <ValuationSelector />

                <SessionObservations />

                <div className="flex justify-end space-x-4 pt-6">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            void form.handleSubmit((data) =>
                                handleCreateSession({
                                    data,
                                    initNotes: false,
                                }),
                            )(e);
                        }}
                    >
                        Save as Draft
                    </Button>

                    <Button
                        onClick={(e) => {
                            void form.handleSubmit((data) =>
                                handleCreateSession({
                                    data,
                                    initNotes: true,
                                }),
                            )(e);
                        }}
                    >
                        Generate Notes
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
