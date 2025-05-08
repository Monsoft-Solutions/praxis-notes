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

import { api, apiClientUtils } from '@api/providers/web';
import { Spinner } from '@shared/ui/spinner.ui';
import { trackEvent } from '@analytics/providers/analytics.provider';

import { Form } from '@shared/ui/form.ui';

import { TourStepId } from '@shared/types/tour-step-id.type';

const sessionDraftButtonId: TourStepId = 'session-form-draft-button';

const sessionGenerateNotesButtonId: TourStepId =
    'session-generate-notes-button';

type SessionFormProps = {
    clientId: string;
    clientName: string;
    sessionId?: string;
    isTour: boolean;
    placeholderSessionData?: ClientSessionForm;
};

export function SessionForm({
    clientId,
    clientName,
    sessionId,
    placeholderSessionData,
    isTour,
}: SessionFormProps) {
    const { mutateAsync: createClientSession } =
        api.clientSession.createClientSession.useMutation();

    const { mutateAsync: updateClientSession } =
        api.clientSession.updateClientSession.useMutation();

    const { mutateAsync: generateNotes } =
        api.notes.generateNotes.useMutation();

    const navigate = useNavigate();

    const isEditMode = !!sessionId;

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
                    linkedAbcEntryIndex: null,
                },
            ],
            valuation: 'good',
            observations: isTour ? 'some observations' : null,
        },
    });

    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Handle saving as draft or updating
    const handleSaveSession = useCallback(
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
            } else if (isEditMode) {
                setIsUpdating(true);
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

            // Handle update or create based on sessionId
            let responseData = null;
            let responseId = sessionId;
            let success = false;

            const sessionData = {
                ...data,
                sessionDate: data.sessionDate.toISOString(),
            };

            if (isEditMode && sessionId) {
                const response = await updateClientSession({
                    sessionId,
                    sessionForm: sessionData,
                });

                success = response.error === null;
                if (success) {
                    responseId = sessionId;
                    trackEvent('session', 'session_update');

                    await apiClientUtils.clientSession.getClientSession.refetch();

                    // After successful update, navigate back to view mode
                    await navigate({
                        to: '/clients/$clientId/sessions/$sessionId',
                        params: { clientId, sessionId },
                    });
                    return; // Exit early after navigation
                } else {
                    toast.error('Error updating session');
                }
            } else {
                const createSessionResponse = await createClientSession({
                    clientId,
                    sessionForm: sessionData,
                });

                if (createSessionResponse.error) {
                    toast.error('Error saving session');
                } else {
                    responseData = createSessionResponse.data;
                    responseId = responseData.id;
                    trackEvent('session', 'session_create');
                    success = true;
                }
            }

            // Handle notes generation if needed and successful
            if (initNotes && success && responseId) {
                void generateNotes({
                    sessionId: responseId,
                    save: true,
                });
                toast.success('Notes generated');
            } else if (isEditMode && success) {
                toast.success('Session updated successfully');
            } else if (success) {
                toast.success('Session saved as draft');
            }

            // Reset loading states
            setIsGeneratingNotes(false);
            setIsUpdating(false);
            setIsSavingDraft(false);

            // Navigate if needed and successful
            if (doNavigate && success && responseId) {
                await navigate({
                    to: '/clients/$clientId/sessions/$sessionId',
                    params: { clientId, sessionId: responseId },
                    search: { isGenerating: initNotes },
                });
            }
        },

        [
            clientId,
            sessionId,
            isEditMode,
            navigate,
            createClientSession,
            updateClientSession,
            generateNotes,
        ],
    );

    useBlocker({
        blockerFn: () => {
            if (isGeneratingNotes || isSavingDraft || isUpdating) return true;

            void form.handleSubmit(
                (data) =>
                    handleSaveSession({
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
        if (isEditMode && sessionId) {
            await navigate({
                to: '/clients/$clientId/sessions/$sessionId',
                params: { clientId, sessionId },
            });
        } else {
            toast.success('Session discarded');
            await navigate({
                to: '/clients/$clientId/sessions',
                params: { clientId },
            });
        }
    };

    useEffect(() => {
        const saveSessionAsDraft = () => {
            void form.handleSubmit((data) =>
                handleSaveSession({
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
    }, [form, handleSaveSession]);

    return (
        <Form {...form}>
            <form className="space-y-8">
                <SessionHeader clientName={clientName} />

                <SessionBasicInfo />

                <ABCCardContainer clientId={clientId} />

                <ReplacementProgramCardContainer clientId={clientId} />

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

                    {isEditMode ? (
                        <Button
                            className="w-36"
                            disabled={isUpdating}
                            onClick={(e) => {
                                void form.handleSubmit((data) =>
                                    handleSaveSession({
                                        data,
                                        initNotes: false,
                                        doNavigate: false,
                                    }),
                                )(e);
                            }}
                        >
                            {isUpdating ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                'Update Session'
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button
                                id={sessionDraftButtonId}
                                variant="secondary"
                                className="w-36"
                                disabled={isGeneratingNotes || isSavingDraft}
                                onClick={(e) => {
                                    void form.handleSubmit((data) =>
                                        handleSaveSession({
                                            data,
                                            initNotes: false,
                                            doNavigate: true,
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
                                        handleSaveSession({
                                            data,
                                            initNotes: true,
                                            doNavigate: true,
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
                        </>
                    )}
                </div>
            </form>
        </Form>
    );
}
