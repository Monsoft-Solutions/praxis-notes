import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@ui/button.ui';
import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId';
import { api } from '@api/providers/web';
import { SessionForm, SessionDetails } from '@src/client-session/components';
import { ConfirmationDialog } from '@shared/ui/confirmation-dialog.ui';
import { ClientSession } from '@src/client-session/schemas';
import { ViewContainer } from '@shared/ui';
import { toast } from 'sonner';
import { useState } from 'react';

function getLinkedAbcEntryIndex(
    linkedAbcEntryId: string | null,
    abcEntries: { id: string }[],
) {
    return abcEntries.findIndex((entry) => entry.id === linkedAbcEntryId);
}

export function ClientSessionDetailsView() {
    const { sessionId } = Route.useParams();
    const search = Route.useSearch();
    const isEdit = Boolean(search.isEdit);
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: sessionQuery } = api.clientSession.getClientSession.useQuery({
        sessionId,
    });

    const deleteSessionMutation =
        api.clientSession.deleteClientSession.useMutation({
            onSuccess: async () => {
                toast.success('Session deleted');
                await navigate({ to: `/clients/${clientId}/sessions` });
            },
            onError: () => {
                toast.error('Failed to delete the session. Please try again.');
            },
        });

    const handleDelete = () => {
        deleteSessionMutation.mutate({ sessionId });
    };

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
            function: entry.function,
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
                linkedAbcEntryIndex: getLinkedAbcEntryIndex(
                    entry.linkedAbcEntryId,
                    session.abcEntries,
                ),
            }),
        ),
        valuation: session.valuation,
        observations: session.observations,
        // TODO: Update this to the actual reinforcer ids
        reinforcerIds: session.reinforcers.map(({ id }) => id),
    };

    const sessionDetails: ClientSession = {
        ...sessionFormData,

        abcEntries: session.abcEntries.map((entry) => ({
            antecedentName: entry.antecedent.name,
            behaviorNames: entry.behaviors.map((b) => b.name),
            interventionNames: entry.interventions.map((i) => i.name),
            id: entry.id,
            function: entry.function,
        })),

        replacementProgramEntries: session.replacementProgramEntries.map(
            (entry) => ({
                replacementProgram: entry.replacementProgram.name,
                teachingProcedure: entry.teachingProcedure?.name ?? null,
                promptingProcedure: entry.promptingProcedure?.name ?? null,
                promptTypes: entry.promptTypes.map((pt) => pt.name),
                clientResponse: entry.clientResponse,
                progress: entry.progress ?? null,
                linkedAbcEntryId: entry.linkedAbcEntryId ?? null,
            }),
        ),

        notes: session.notes,

        userInitials: session.userInitials,
        clientInitials: session.clientInitials,

        reinforcerNames: session.reinforcers.map(({ name }) => name),
    };

    if (isEdit) {
        return (
            <ViewContainer>
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
            </ViewContainer>
        );
    }

    return (
        <ViewContainer>
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
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDeleteDialogOpen(true);
                        }}
                        disabled={deleteSessionMutation.isPending}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <SessionDetails session={sessionDetails} sessionId={sessionId} />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Session"
                description="Are you sure you want to delete this session? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </ViewContainer>
    );
}
