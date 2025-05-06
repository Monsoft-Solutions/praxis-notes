import { Separator } from '@ui/separator.ui';
import { useEffect } from 'react';

import { ClientForm } from '../../components';
import { trackEvent } from '@analytics/providers';

import { Route } from '@routes/_private/_app/clients/new';

import { api } from '@api/providers/web';

const tourData = {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male' as const,
    notes: 'This is a test client',
    behaviors: [
        {
            id: 'behavior-1                          ',
            type: 'frequency' as const,
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
};

export function NewClientView() {
    const { fromDraft } = Route.useSearch();

    const { loggedInUser } = Route.useRouteContext();

    const { data: clientQuery } = api.client.getClient.useQuery(
        {
            clientId: fromDraft ?? '',
        },

        {
            enabled: fromDraft !== undefined,
        },
    );

    useEffect(() => {
        trackEvent('client', 'client_create_view');
    }, []);

    if (fromDraft && clientQuery === undefined) return;

    const draftData = !fromDraft
        ? undefined
        : clientQuery === undefined
          ? undefined
          : clientQuery.error
            ? undefined
            : clientQuery.data;

    const initialData = !loggedInUser.hasDoneTour ? tourData : draftData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="mt-2 text-3xl font-bold">Add New Client</h1>

                <p className="text-muted-foreground mt-1">
                    Create a new client record with behaviors, replacement
                    programs, and interventions.
                </p>
            </div>

            <Separator />

            {initialData === undefined ? (
                <ClientForm />
            ) : (
                <ClientForm initialData={initialData} draftId={fromDraft} />
            )}
        </div>
    );
}
