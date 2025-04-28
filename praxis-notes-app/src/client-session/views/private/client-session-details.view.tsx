import { Link } from '@tanstack/react-router';

import { format } from 'date-fns';

import {
    Clock,
    MapPin,
    Calendar,
    Users,
    ArrowLeft,
    Pencil,
} from 'lucide-react';

import { Button } from '@ui/button.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { Badge } from '@ui/badge.ui';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/$sessionId';

import { api } from '@api/providers/web';

import { NotesEditor } from '@src/notes/components/notes-editor.component';

export function ClientSessionDetailsView() {
    const { sessionId } = Route.useParams();

    const { data: sessionQuery } = api.clientSession.getClientSession.useQuery({
        sessionId,
    });

    if (!sessionQuery) return null;
    if (sessionQuery.error) return null;
    const { data: session } = sessionQuery;

    const { clientId } = session;

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
                    // to="/clients/$clientId/sessions/$sessionId/edit"
                    // params={{ clientId, sessionId }}
                    >
                        <Button variant="outline" size="sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Session
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                            <Calendar className="text-muted-foreground mt-1 h-4 w-4" />

                            <div>
                                <div className="font-medium">Date</div>

                                <div className="text-muted-foreground text-sm">
                                    {format(
                                        new Date(session.sessionDate),
                                        'MMMM d, yyyy',
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Clock className="text-muted-foreground mt-1 h-4 w-4" />

                            <div>
                                <div className="font-medium">Time</div>
                                <div className="text-muted-foreground text-sm">
                                    {session.startTime} - {session.endTime}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin className="text-muted-foreground mt-1 h-4 w-4" />

                            <div>
                                <div className="font-medium">Location</div>
                                <div className="text-muted-foreground text-sm">
                                    {session.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Users className="text-muted-foreground mt-1 h-4 w-4" />

                            <div>
                                <div className="font-medium">Participants</div>

                                <div className="mt-1 flex flex-wrap gap-1">
                                    {session.participants.length ? (
                                        session.participants.map(
                                            ({ name }, index: number) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                >
                                                    {name}
                                                </Badge>
                                            ),
                                        )
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            No participants recorded
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Environmental Changes</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {session.environmentalChanges.length ? (
                            <ul className="list-disc space-y-1 pl-5">
                                {session.environmentalChanges.map(
                                    ({ name }, index: number) => (
                                        <li key={index} className="text-sm">
                                            {name}
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No environmental changes recorded
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ABC Entries</CardTitle>
                </CardHeader>

                <CardContent>
                    {session.abcEntries.length ? (
                        <div className="space-y-6">
                            {session.abcEntries.map(
                                (
                                    {
                                        id,
                                        antecedent,
                                        behaviors,
                                        interventions,
                                    },
                                    index: number,
                                ) => (
                                    <div
                                        key={id}
                                        className="rounded-lg border p-4"
                                    >
                                        <h3 className="mb-2 font-semibold">
                                            Entry {index + 1}
                                        </h3>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Antecedent/Activity
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {antecedent.name}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Behavior
                                                </h4>

                                                {behaviors.map((behavior) => (
                                                    <p
                                                        key={behavior.id}
                                                        className="mt-1 text-sm"
                                                    >
                                                        {behavior.name}
                                                    </p>
                                                ))}
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Intervention
                                                </h4>

                                                {interventions.map(
                                                    (intervention) => (
                                                        <p
                                                            key={
                                                                intervention.id
                                                            }
                                                            className="mt-1 text-sm"
                                                        >
                                                            {intervention.name}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No ABC entries recorded
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Replacement Program</CardTitle>
                </CardHeader>

                <CardContent>
                    {session.replacementProgramEntries.length ? (
                        <div className="space-y-6">
                            {session.replacementProgramEntries.map(
                                (
                                    {
                                        id,
                                        replacementProgram,
                                        teachingProcedure,
                                        promptingProcedure,
                                        clientResponse,
                                        progress,
                                        promptTypes,
                                    },
                                    index: number,
                                ) => (
                                    <div
                                        key={id}
                                        className="rounded-lg border p-4"
                                    >
                                        <h3 className="mb-2 font-semibold">
                                            Entry {index + 1}
                                        </h3>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Replacement Program
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {replacementProgram.name}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Teaching Procedure
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {teachingProcedure?.name}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Prompts Used
                                                </h4>

                                                {promptTypes.map(
                                                    (promptType) => (
                                                        <p
                                                            key={promptType.id}
                                                            className="mt-1 text-sm"
                                                        >
                                                            {promptType.name}
                                                        </p>
                                                    ),
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Prompting Procedure
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {promptingProcedure?.name}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Client Response
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {clientResponse}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Progress
                                                </h4>

                                                <p className="mt-1 text-sm">
                                                    {progress}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No replacement program entries recorded
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Session Valuation</CardTitle>
                </CardHeader>

                <CardContent>
                    <Badge
                        className={
                            session.valuation === 'good'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : session.valuation === 'fair'
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                    >
                        {session.valuation === 'good'
                            ? 'Good'
                            : session.valuation === 'fair'
                              ? 'Fair'
                              : 'Poor'}
                    </Badge>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Observations</CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-sm">{session.observations}</p>
                </CardContent>
            </Card>

            <NotesEditor
                sessionId={sessionId}
                initialData={session.notes ?? undefined}
            />
        </div>
    );
}
