import { useEffect, useState, useCallback } from 'react';

import { useBlocker, useNavigate } from '@tanstack/react-router';

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

import { TourStepId } from '@shared/types/tour-step-id.type';

import { wait } from '@shared/utils/wait.util';

const sessionDraftButtonId: TourStepId = 'session-form-draft-button';

const sessionGenerateNotesButtonId: TourStepId =
    'session-generate-notes-button';

type SessionFormProps = {
    clientId: string;
    clientName: string;
    sessionId?: string;
    sessionStatus?: string;
    isTour: boolean;
    placeholderSessionData?: ClientSessionForm;
};

export function SessionForm({
    clientId,
    clientName,
    placeholderSessionData,
    isTour,
}: SessionFormProps) {
    const { mutateAsync: createClientSession } =
        api.clientSession.createClientSession.useMutation();

    const { mutateAsync: generateNotes } =
        api.notes.generateNotes.useMutation();

    const navigate = useNavigate();

    // Initialize form with default values or initial data if provided
    const form = useForm<ClientSessionForm>({
        resolver: zodResolver(clientSessionFormSchema),

        defaultValues: placeholderSessionData ?? {
            sessionDate: new Date(),
            startTime: isTour ? '12:00' : undefined,
            endTime: isTour ? '13:00' : undefined,
            location: isTour ? 'home' : undefined,
            presentParticipants: [],
            environmentalChanges: [],
            abcIdEntries: [
                {
                    antecedentId: isTour
                        ? 'antecedent-1                        '
                        : undefined,
                    behaviorIds: [],
                    interventionIds: [],
                    function: 'atention',
                },
            ],
            replacementProgramEntries: [
                {
                    replacementProgramId: isTour
                        ? 'replacement-program-1               '
                        : undefined,
                    teachingProcedureId: null,
                    promptingProcedureId: null,
                    clientResponse: null,
                    progress: null,
                    promptTypesIds: [],
                },
            ],
            valuation: 'good',
            observations: isTour ? 'some observations' : null,
        },
    });

    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Handle saving as draft
    const handleCreateSession = useCallback(
        async ({
            data,
            initNotes,
            doNavigate = true,
        }: {
            data: ClientSessionForm;
            initNotes: boolean;
            doNavigate?: boolean;
        }) => {
            if (initNotes) {
                setIsGeneratingNotes(true);
            } else {
                setIsSavingDraft(true);
            }

            const abcEntries = data.abcIdEntries.filter(
                (entry) => entry.antecedentId,
            );

            data.abcIdEntries = abcEntries;

            const replacementProgramEntries =
                data.replacementProgramEntries.filter(
                    (entry) => entry.replacementProgramId,
                );

            data.replacementProgramEntries = replacementProgramEntries;

            const response = await createClientSession({
                clientId,
                sessionForm: {
                    ...data,
                    sessionDate: data.sessionDate.toISOString(),
                },
            });

            const success = response.error === null;

            if (initNotes) {
                if (success) {
                    await navigate({
                        to: '/clients/$clientId/sessions/$sessionId',
                        params: { clientId, sessionId: response.data.id },
                    });

                    await wait(1000);

                    await generateNotes({
                        sessionId: response.data.id,
                    });
                }

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
            trackEvent('session', 'session_create');

            const { id } = response.data;

            if (doNavigate) {
                await navigate({
                    to: '/clients/$clientId/sessions/$sessionId',
                    params: { clientId, sessionId: id },
                });
            }
        },
        [clientId, navigate, createClientSession, generateNotes],
    );

    useBlocker({
        blockerFn: () => {
            if (isGeneratingNotes || isSavingDraft) return true;

            void form.handleSubmit(
                (data) =>
                    handleCreateSession({
                        data,
                        initNotes: false,
                        doNavigate: false,
                    }),
                () => {
                    toast.error('Session was discarded');
                },
            )();
            return true;
        },
    });

    // Handle cancellation
    const handleCancel = async () => {
        toast.success('Session discarded');

        await navigate({
            to: '/clients/$clientId/sessions',
            params: { clientId },
        });
    };

    useEffect(() => {
        const saveSessionAsDraft = () => {
            void form.handleSubmit((data) =>
                handleCreateSession({
                    data,
                    initNotes: false,
                }),
            )();
        };

        window.addEventListener('saveSessionAsDraft', saveSessionAsDraft);

        return () => {
            window.removeEventListener(
                'saveSessionAsDraft',
                saveSessionAsDraft,
            );
        };
    }, [form, handleCreateSession]);

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
                        id={sessionDraftButtonId}
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
                        id={sessionGenerateNotesButtonId}
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
