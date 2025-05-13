import React from 'react';
import { format } from 'date-fns';
import {
    Clock,
    MapPin,
    Calendar,
    Users,
    Settings,
    ListChecks,
    Replace,
    BarChart,
    Award,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';
import { Badge } from '@ui/badge.ui';
import { NotesEditor } from '@src/notes/components/notes-editor.component';
import { ScrollArea } from '@ui/scroll-area.ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@ui/table.ui';

import { ClientSession } from '../schemas';
import { ClientSessionReplacementProgramEntry as ReplacementProgramEntry } from '../schemas/client-session-replacement-program-entry.schema';

type SessionDetailsProps = {
    session: ClientSession;
    sessionId: string;
};

/*
    It is used to display the linked ABC entry in the replacement program table.
*/
function getLinkedAbcText(
    entry: ReplacementProgramEntry,
    abcEntries: ClientSession['abcEntries'],
): string {
    const { linkedAbcEntryId } = entry;
    const linkedAbc = linkedAbcEntryId
        ? abcEntries.find((abc) => abc.id === linkedAbcEntryId)
        : undefined;

    const linkedAbcIndex = linkedAbc ? abcEntries.indexOf(linkedAbc) : -1;

    const linkedAbcText = linkedAbc
        ? `ABC - ${linkedAbcIndex + 1} - ${linkedAbc.antecedentName}`
        : '-';

    return linkedAbcText;
}

export function SessionDetails({ session, sessionId }: SessionDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-floating">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="bg-primary/10 rounded-full p-1.5">
                                <Calendar className="text-primary h-4 w-4" />
                            </div>
                            Session Information
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-muted rounded-md p-2">
                                <Calendar className="text-muted-foreground h-4 w-4" />
                            </div>

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

                        <div className="flex items-start gap-3">
                            <div className="bg-muted rounded-md p-2">
                                <Clock className="text-muted-foreground h-4 w-4" />
                            </div>

                            <div>
                                <div className="font-medium">Time</div>
                                <div className="text-muted-foreground text-sm">
                                    {session.startTime} - {session.endTime}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-4">
                            <div className="bg-muted rounded-md p-2">
                                <MapPin className="text-muted-foreground h-4 w-4" />
                            </div>

                            <div>
                                <div className="font-medium">Location</div>
                                <div className="text-muted-foreground text-sm">
                                    {session.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-4">
                            <div className="bg-muted rounded-md p-2">
                                <Users className="text-muted-foreground h-4 w-4" />
                            </div>

                            <div>
                                <div className="font-medium">Participants</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {session.presentParticipants.length ? (
                                        session.presentParticipants.map(
                                            (participant, index: number) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-secondary/70 px-2 py-1 text-xs font-normal"
                                                >
                                                    {participant}
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

                        <div className="col-span-2 flex items-start gap-3 pt-4">
                            <div className="bg-muted rounded-md p-2">
                                <Settings className="text-muted-foreground h-4 w-4" />
                            </div>

                            <div>
                                <div className="font-medium">
                                    Environmental Changes
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {session.environmentalChanges.length ? (
                                        session.environmentalChanges.map(
                                            (change, index: number) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-secondary/70 px-2 py-1 text-xs font-normal"
                                                >
                                                    {change}
                                                </Badge>
                                            ),
                                        )
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            No environmental changes recorded
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-floating border">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="bg-primary/10 rounded-full p-1.5">
                                <BarChart className="text-primary h-4 w-4" />
                            </div>
                            Session Valuation &amp; Observations
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-4 pt-4">
                        <div>
                            <div className="mb-2 font-medium">Valuation</div>
                            <Badge
                                className={`px-3 py-1 text-sm font-normal ${
                                    session.valuation === 'good'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : session.valuation === 'fair'
                                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                            >
                                {session.valuation === 'good'
                                    ? 'Good'
                                    : session.valuation === 'fair'
                                      ? 'Fair'
                                      : 'Poor'}
                            </Badge>
                        </div>

                        <div>
                            <div className="mb-2 font-medium">Observations</div>
                            <ScrollArea className="h-[100px] pr-4">
                                {session.observations ? (
                                    <p className="whitespace-pre-line text-sm">
                                        {session.observations}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">
                                        No observations recorded
                                    </p>
                                )}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-floating border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 rounded-full p-1.5">
                            <ListChecks className="text-primary h-4 w-4" />
                        </div>
                        ABC Entries
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                    {session.abcEntries.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        Entry
                                    </TableHead>
                                    <TableHead>Antecedent/Activity</TableHead>
                                    <TableHead>Behavior</TableHead>
                                    <TableHead>Intervention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {session.abcEntries.map(
                                    (
                                        {
                                            antecedentName,
                                            behaviorNames,
                                            interventionNames,
                                        },
                                        index,
                                    ) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                {antecedentName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {behaviorNames.map(
                                                        (behavior) => (
                                                            <Badge
                                                                key={behavior}
                                                                variant="outline"
                                                                className="mr-1 font-normal"
                                                            >
                                                                {behavior}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {interventionNames.map(
                                                        (intervention) => (
                                                            <Badge
                                                                key={
                                                                    intervention
                                                                }
                                                                variant="outline"
                                                                className="mr-1 font-normal"
                                                            >
                                                                {intervention}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">
                            No ABC entries recorded
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-floating border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 rounded-full p-1.5">
                            <Replace className="text-primary h-4 w-4" />
                        </div>
                        Replacement Program
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                    {session.replacementProgramEntries.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">
                                        Entry
                                    </TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Teaching Procedure</TableHead>
                                    <TableHead>Prompting Procedure</TableHead>
                                    <TableHead>Prompts Used</TableHead>
                                    <TableHead>Client Response</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Linked ABC Entry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {session.replacementProgramEntries.map(
                                    (entry, index) => {
                                        const linkedAbcText = getLinkedAbcText(
                                            entry,
                                            session.abcEntries,
                                        );

                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.replacementProgram}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.teachingProcedure ??
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.promptingProcedure ??
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {entry.promptTypes
                                                            .length ? (
                                                            entry.promptTypes.map(
                                                                (
                                                                    promptType,
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            promptType
                                                                        }
                                                                        variant="secondary"
                                                                        className="text-xs font-normal"
                                                                    >
                                                                        {
                                                                            promptType
                                                                        }
                                                                    </Badge>
                                                                ),
                                                            )
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {entry.clientResponse ??
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.progress ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {linkedAbcText}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    },
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">
                            No replacement program entries recorded
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-floating border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="bg-primary/10 rounded-full p-1.5">
                            <Award className="text-primary h-4 w-4" />
                        </div>
                        Reinforcers
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                    {session.reinforcerNames.length ? (
                        <div className="flex flex-wrap gap-2">
                            {session.reinforcerNames.map(
                                (reinforcer, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm font-normal"
                                    >
                                        {reinforcer}
                                    </Badge>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">
                            No reinforcers recorded
                        </p>
                    )}
                </CardContent>
            </Card>

            <NotesEditor
                sessionId={sessionId}
                initialData={session.notes ?? ''}
            />
        </div>
    );
}
