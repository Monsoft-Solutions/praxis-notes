import { useEffect } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';

import { format } from 'date-fns';

import { PlusCircle, Calendar, Clock } from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions';

import { api } from '@api/providers/web';

import { TourStepId } from '@shared/types/tour-step-id.type';

const addSessionButtonId: TourStepId = 'add-session-button';

export const ClientSessionsView = () => {
    const navigate = useNavigate();

    const { clientId } = Route.useParams();

    const { data: clientSessionsQuery } =
        api.clientSession.getClientSessions.useQuery({
            clientId,
        });

    useEffect(() => {
        const handler = () => {
            void navigate({
                to: '/clients/$clientId/sessions/new',
                params: { clientId },
            });
        };

        window.addEventListener('navigateToAddSession', handler);

        return () => {
            window.removeEventListener('navigateToAddSession', handler);
        };
    }, [clientId, navigate]);

    if (!clientSessionsQuery) return null;
    const { error } = clientSessionsQuery;
    if (error) return null;
    const { data: clientSessions } = clientSessionsQuery;

    // Get client name from first session or use placeholder
    const clientName = 'Client';

    return (
        <div className="container mx-auto space-y-6 px-0 py-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Sessions for {clientName}
                </h1>

                <Link
                    id={addSessionButtonId}
                    to="/clients/$clientId/sessions/new"
                    params={{ clientId }}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Session
                    </Button>
                </Link>
            </div>

            {clientSessions.length === 0 ? (
                <div className="bg-muted/10 rounded-lg border p-12 text-center">
                    <h3 className="mb-2 text-lg font-medium">
                        No Sessions Yet
                    </h3>

                    <p className="text-muted-foreground mb-6">
                        Create your first session to get started
                    </p>

                    <Link
                        to="/clients/$clientId/sessions/new"
                        params={{ clientId }}
                    >
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Session
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {clientSessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-card flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="space-y-1">
                                <div className="font-medium">
                                    <Calendar className="mr-2 inline-block h-4 w-4" />
                                    {format(
                                        new Date(session.sessionDate),
                                        'MMMM d, yyyy',
                                    )}
                                </div>

                                <div className="text-muted-foreground text-sm">
                                    <Clock className="mr-2 inline-block h-3 w-3" />
                                    {session.startTime} - {session.endTime}
                                </div>

                                <div className="text-muted-foreground text-sm">
                                    Location: {session.location}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to="/clients/$clientId/sessions/$sessionId"
                                    params={{ clientId, sessionId: session.id }}
                                >
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
