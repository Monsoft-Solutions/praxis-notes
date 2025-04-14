import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm, FormProvider } from 'react-hook-form';

import { toast } from 'sonner';

import { ClientSession, clientSessionSchema } from '../schemas';

import { Button } from '@ui/button.ui';

import { SessionHeader } from './session-header.component';

import { SessionBasicInfo } from './session-basic-info.component';
import { ABCCardContainer } from './abc-card-container.component';
import { ValuationSelector } from './valuation-selector.component';

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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const navigate = useNavigate();

    // Initialize form with default values or initial data if provided
    const form = useForm<ClientSession>({
        resolver: zodResolver(clientSessionSchema),

        defaultValues: {
            sessionDate: new Date(),
            startTime: '',
            endTime: '',
            location: '',
            presentParticipants: [],
            environmentalChanges: [],
            abcEntries: [
                {
                    antecedent: '',
                    behavior: '',
                    intervention: '',
                },
            ],
            valuation: 'good',
        },
    });

    // Handle saving as draft
    const handleSaveDraft = async (data: ClientSession) => {
        setIsSubmitting(true);

        console.log('data', data);

        toast.success('Session saved as draft');

        const response = await createClientSession({
            clientId,
            sessionForm: {
                ...data,
                sessionDate: data.sessionDate.toISOString(),
            },
        });

        if (response.error) {
            toast.error('Error saving session');
            return;
        }

        const { id } = response.data;

        await navigate({
            to: '/clients/$clientId/sessions/$sessionId',
            params: { clientId, sessionId: id },
        });
    };

    // Handle generating notes
    const handleGenerateNotes = async (data: ClientSession) => {
        console.log('generating notes', data);

        setIsGenerating(true);

        toast.success('Notes generated successfully');

        const sessionId = 'session-id';

        await navigate({
            to: '/clients/$clientId/sessions/$sessionId/notes',
            params: { clientId, sessionId },
        });

        setIsGenerating(false);
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

                <ValuationSelector />

                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting || isGenerating}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            void form.handleSubmit(handleSaveDraft)(e);
                        }}
                        disabled={isSubmitting || isGenerating}
                        className={
                            isSubmitting ? 'cursor-not-allowed opacity-70' : ''
                        }
                    >
                        {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </Button>

                    <Button
                        onClick={() => form.handleSubmit(handleGenerateNotes)}
                        disabled={isSubmitting || isGenerating}
                        className={
                            isGenerating ? 'cursor-not-allowed opacity-70' : ''
                        }
                    >
                        {isGenerating ? 'Generating...' : 'Generate Notes'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
