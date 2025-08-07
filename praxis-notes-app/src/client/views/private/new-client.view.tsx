import { useEffect } from 'react';
import { UserPlus } from 'lucide-react';

import { ClientForm } from '../../components';
import { trackEvent } from '@analytics/providers';

import { Route } from '@routes/_private/_app/clients/new';

import { api } from '@api/providers/web';
import { ViewContainer } from '@shared/ui';

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
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
            {/* Very subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {/* Subtle geometric shapes */}
                <div
                    className="absolute left-10 top-20 hidden h-12 w-12 rounded-full border-2 border-blue-200 opacity-30 sm:block"
                    style={{ transform: 'rotate(0.1deg)' }}
                ></div>

                <div className="absolute bottom-32 right-16 hidden h-8 w-8 rounded border border-green-200 opacity-40 sm:block"></div>

                {/* Small dots */}
                <div className="absolute bottom-20 left-1/4 hidden h-2 w-2 rounded-full bg-orange-200 opacity-50 lg:block"></div>

                <div className="absolute right-1/3 top-1/3 hidden h-3 w-3 rounded border border-yellow-300 opacity-35 lg:block"></div>
            </div>

            <ViewContainer>
                {/* Header Card with Thumb Tack */}
                <div
                    className="relative rounded-3xl border-2 border-blue-200 bg-white p-6 shadow-lg"
                    style={{
                        borderRadius: '25px 30px 20px 35px',
                    }}
                >
                    {/* Thumb tack */}
                    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                        <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                    </div>

                    {/* Header content */}
                    <div className="pt-2">
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-8 w-8 text-blue-400" />
                            <div>
                                <h1
                                    className="font-quicksand text-3xl font-bold text-gray-800"
                                    style={{
                                        textShadow:
                                            '1px 1px 2px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    Add New Client
                                </h1>
                                <p className="font-nunito text-muted-foreground mt-1">
                                    Create a new client record with behaviors,
                                    replacement programs, and interventions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                {initialData === undefined ? (
                    <ClientForm />
                ) : (
                    <ClientForm initialData={initialData} draftId={fromDraft} />
                )}
            </ViewContainer>
        </div>
    );
}
