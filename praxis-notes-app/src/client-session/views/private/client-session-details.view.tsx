import { Link } from '@tanstack/react-router';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@ui/button.ui';
import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId';
import { api } from '@api/providers/web';
import { SessionForm, SessionDetails } from '@src/client-session/components';

import { ClientSession } from '@src/client-session/schemas';

export function ClientSessionDetailsView() {
    const { sessionId } = Route.useParams();
    const search = Route.useSearch();
    const isEdit = Boolean(search.isEdit);

    const { data: sessionQuery } = api.clientSession.getClientSession.useQuery({
        sessionId,
    });

    if (!sessionQuery) return null;
    if (sessionQuery.error) return null;
    const { data: session } = sessionQuery;

    const { clientId } = session;

    // Transform session data to match the SessionForm expected format
    const sessionFormData = {
        sessionDate: new Date(session.sessionDate),
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        presentParticipants: session.participants.map((p) => p.name),
        environmentalChanges: session.environmentalChanges.map((ec) => ec.name),
        abcIdEntries: session.abcEntries.map((entry) => ({
            antecedentId: entry.antecedent.id,
            behaviorIds: entry.behaviors.map((b) => b.id),
            interventionIds: entry.interventions.map((i) => i.id),
            // Use specific enum type expected by the form
            function: 'atention' as const,
        })),
        replacementProgramEntries: session.replacementProgramEntries.map(
            (entry) => ({
                replacementProgramId: entry.replacementProgram.id,
                teachingProcedureId: entry.teachingProcedure?.id ?? null,
                promptingProcedureId: entry.promptingProcedure?.id ?? null,
                clientResponse: entry.clientResponse,
                // Ensure progress is a string if it exists
                progress:
                    entry.progress != null ? String(entry.progress) : null,
                promptTypesIds: entry.promptTypes.map((pt) => pt.id),
            }),
        ),
        valuation: session.valuation,
        observations: session.observations,
    };

    const sessionDetails: ClientSession = {
        ...sessionFormData,

        abcEntries: session.abcEntries.map((entry) => ({
            antecedentName: entry.antecedent.name,
            behaviorNames: entry.behaviors.map((b) => b.name),
            interventionNames: entry.interventions.map((i) => i.name),
        })),

        replacementProgramEntries: session.replacementProgramEntries.map(
            (entry) => ({
                replacementProgram: entry.replacementProgram.name,
                teachingProcedure: entry.teachingProcedure?.name ?? null,
                promptingProcedure: entry.promptingProcedure?.name ?? null,
                promptTypes: entry.promptTypes.map((pt) => pt.name),
                clientResponse: entry.clientResponse,
                progress: entry.progress ?? null,
            }),
        ),

        notes: session.notes,

        userInitials: session.userInitials,
        clientInitials: session.clientInitials,
    };

    if (isEdit) {
        return (
            <div className="container mx-auto px-0 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/clients/${clientId}/sessions/${sessionId}`}
                            params={{ clientId, sessionId }}
                        >
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Session</h1>
                    </div>
                </div>
                <SessionForm
                    clientId={clientId}
                    clientName={session.client.firstName}
                    sessionId={sessionId}
                    isTour={false}
                    placeholderSessionData={{
                        ...sessionFormData,
                        replacementProgramEntries:
                            sessionFormData.replacementProgramEntries.map(
                                (entry) => ({
                                    ...entry,
                                    progress:
                                        entry.progress !== null
                                            ? Number(entry.progress)
                                            : null,
                                }),
                            ),
                    }}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6 px-0 py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        to={`/clients/${clientId}/sessions`}
                        params={{ clientId }}
                    >
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Session Details</h1>
                </div>

                <div className="flex space-x-2">
                    <Link
                        to={`/clients/${clientId}/sessions/${sessionId}`}
                        params={{ clientId, sessionId }}
                        search={{ isEdit: true }}
                    >
                        <Button variant="outline" size="sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Session
                        </Button>
                    </Link>
                </div>
            </div>

            <SessionDetails session={sessionDetails} sessionId={sessionId} />
        </div>
    );
}
