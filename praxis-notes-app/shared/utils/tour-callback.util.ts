import { router } from '@web/router';

import { CallBackProps } from 'react-joyride';

import { TourStepId } from '@shared/types/tour-step-id.type';

import { wait } from './wait.util';

import { vanillaApi } from '@api/providers/web';

import { toast } from 'sonner';

const sendCustomEvent = (name: string, detail?: Record<string, unknown>) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
};

const setClientFormStep = (step: number) => {
    sendCustomEvent('clientFormStepChange', { step });
};

const submitClientForm = () => {
    sendCustomEvent('clientFormSubmit');
};

const navigateToFirstClientSessions = () => {
    sendCustomEvent('navigateToFirstClientSessions');
};

const navigateToAddSession = () => {
    sendCustomEvent('navigateToAddSession');
};

const saveSessionAsDraft = () => {
    sendCustomEvent('saveSessionAsDraft');
};

const generateNotes = () => {
    sendCustomEvent('generateNotes');
};

const saveNotes = () => {
    sendCustomEvent('saveNotes');
};

const downloadNotes = () => {
    sendCustomEvent('downloadNotes');
};

const setHasDoneTour = () => {
    void vanillaApi.auth.setHasDoneTour.mutate();
};

export const tourCallback = ({
    data,
    setStepIndex,
}: {
    data: CallBackProps;
    setStepIndex: (stepIndex: number) => void;
}) => {
    void (async () => {
        const {
            index,
            action,
            type,
            step: { target },
        } = data;

        if (action === 'skip') {
            setHasDoneTour();
            return;
        }

        if (typeof target !== 'string') return;

        const id = target.slice(1) as TourStepId;

        if (action === 'next' && type === 'step:after') {
            switch (id) {
                case 'client-sidebar-item':
                    await router.navigate({ to: '/clients' });
                    break;

                case 'add-client-button':
                    await router.navigate({ to: '/clients/new' });
                    break;

                case 'client-form-basic-info-step':
                    setClientFormStep(2);
                    break;

                case 'client-form-behavior-step':
                    setClientFormStep(3);
                    break;

                case 'client-form-programs-step':
                    setClientFormStep(4);
                    break;

                case 'client-form-interventions-step':
                    setClientFormStep(5);
                    break;

                case 'client-form-review-step':
                    submitClientForm();
                    break;

                case 'view-sessions-button':
                    navigateToFirstClientSessions();
                    break;

                case 'add-session-button':
                    navigateToAddSession();
                    break;

                case 'session-form-draft-button':
                    saveSessionAsDraft();
                    break;

                case 'notes-editor-generate-button':
                    generateNotes();
                    setHasDoneTour();
                    break;

                case 'save-notes-button':
                    saveNotes();
                    setHasDoneTour();
                    break;

                case 'download-notes-button':
                    downloadNotes();
                    toast.success(
                        'Congrats! You have completed the intro tour.',
                    );
                    setHasDoneTour();
                    break;

                default:
                    break;
            }

            await wait(1000);

            setStepIndex(index + 1);
        }
    })();
};
