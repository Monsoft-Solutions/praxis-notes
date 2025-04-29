import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

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
import { Spinner } from '@shared/ui/spinner.ui';
import { trackEvent } from '@analytics/providers/analytics.provider';

import { Form } from '@shared/ui/form.ui';

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
            startTime: undefined,
            endTime: undefined,
            location: undefined,
            presentParticipants: [],
            environmentalChanges: [],
            abcIdEntries: [
                {
                    antecedentId: undefined,
                    behaviorIds: [],
                    interventionIds: [],
                    function: 'atention',
                },
            ],
            replacementProgramEntries: [
                {
                    replacementProgramId: undefined,
                    teachingProcedureId: null,
                    promptingProcedureId: null,
                    clientResponse: null,
                    progress: null,
                    promptTypesIds: [],
                },
            ],
            valuation: 'good',
            observations: null,
        },
    });

    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Handle saving as draft
    const handleCreateSession = async ({
        data,
        initNotes,
    }: {
        data: ClientSessionForm;
        initNotes: boolean;
    }) => {
        if (initNotes) {
            setIsGeneratingNotes(true);
        } else {
            setIsSavingDraft(true);
        }

        const response = await createClientSession({
            clientId,
            initNotes,
            sessionForm: {
                ...data,
                sessionDate: data.sessionDate.toISOString(),
            },
        });

        if (initNotes) {
            setIsGeneratingNotes(false);
        } else {
            setIsSavingDraft(false);
        }

        if (response.error) {
            toast.error('Error saving session');
            return;
        }

        if (initNotes) {
            toast.success('Notes generated');
        } else {
            toast.success('Session saved as draft');
        }

        // Track session creation regardless of notes generation
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        trackEvent('session', 'session_create');

        const { id } = response.data;

        await navigate({
            to: '/clients/$clientId/sessions/$sessionId',
            params: { clientId, sessionId: id },
        });
    };

    // Handle cancellation
    const handleCancel = async () => {
        toast.success('Session discarded');

        await navigate({
            to: '/clients/$clientId/sessions',
            params: { clientId },
        });
    };

    return (
        <Form {...form}>
            <form className="space-y-8">
                <SessionHeader clientName={clientName} />

                <SessionBasicInfo />

                <ABCCardContainer />

                <ReplacementProgramCardContainer />

                <ValuationSelector />

                <SessionObservations />

                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            void handleCancel();
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-36"
                        disabled={isGeneratingNotes || isSavingDraft}
                        onClick={(e) => {
                            void form.handleSubmit((data) =>
                                handleCreateSession({
                                    data,
                                    initNotes: false,
                                }),
                            )(e);
                        }}
                    >
                        {isSavingDraft ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            'Save as Draft'
                        )}
                    </Button>

                    <Button
                        className="w-36"
                        disabled={isGeneratingNotes || isSavingDraft}
                        onClick={(e) => {
                            void form.handleSubmit((data) =>
                                handleCreateSession({
                                    data,
                                    initNotes: true,
                                }),
                            )(e);
                        }}
                    >
                        {isGeneratingNotes ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            'Generate Notes'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
