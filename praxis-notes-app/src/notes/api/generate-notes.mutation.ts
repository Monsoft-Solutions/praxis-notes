import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { generateNotes as generateNotesProvider } from '../providers/server/generate-notes.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { getClientAbaData } from '@src/client/providers';

import { emit } from '@events/providers';

import { clientSessionTable } from '@src/client-session/db';
import { ClientSession } from '@src/client-session/schemas';

// mutation to generate notes
export const generateNotes = protectedEndpoint
    .input(z.object({ sessionId: z.string(), save: z.boolean().optional() }))
    .mutation(
        queryMutationCallback(async ({ input: { sessionId, save } }) => {
            const { data: clientSession, error } = await catchError(
                db.query.clientSessionTable.findFirst({
                    where: (record) => eq(record.id, sessionId),

                    with: {
                        participants: true,
                        environmentalChanges: true,
                        abcEntries: {
                            with: {
                                antecedent: true,
                                behaviors: {
                                    with: {
                                        behavior: true,
                                    },
                                },
                                interventions: {
                                    with: {
                                        intervention: true,
                                    },
                                },
                            },
                        },
                        replacementProgramEntries: {
                            with: {
                                replacementProgram: true,
                                teachingProcedure: true,
                                promptingProcedure: true,
                                promptTypes: {
                                    with: {
                                        promptType: true,
                                    },
                                },
                            },
                        },
                        client: true,
                        user: true,
                        reinforcers: {
                            with: {
                                reinforcer: true,
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            if (!clientSession) return Error('NOT_FOUND');

            const abcEntriesNullable = clientSession.abcEntries.map(
                ({ antecedent, behaviors, interventions, id }) => {
                    if (!antecedent) return null;

                    const antecedentName = antecedent.name;

                    const behaviorNamesNullable = behaviors.map(
                        ({ behavior }) => behavior?.name,
                    );

                    const behaviorNames = behaviorNamesNullable.filter(
                        (behaviorName) => behaviorName !== undefined,
                    );

                    if (behaviorNames.length !== behaviors.length) return null;

                    const interventionNamesNullable = interventions.map(
                        ({ intervention }) => intervention?.name,
                    );

                    const interventionNames = interventionNamesNullable.filter(
                        (interventionName) => interventionName !== undefined,
                    );

                    if (interventionNames.length !== interventions.length)
                        return null;

                    return {
                        antecedentName,
                        behaviorNames,
                        interventionNames,
                        id,
                    };
                },
            );

            const abcEntries = abcEntriesNullable.filter((abc) => abc !== null);

            const { data: clientData, error: clientDataError } =
                await getClientAbaData(clientSession.client.id);

            if (clientDataError) return Error();

            const replacementProgramEntries =
                clientSession.replacementProgramEntries
                    .map(
                        ({
                            replacementProgram,
                            teachingProcedure,
                            promptingProcedure,
                            promptTypes,
                            progress,
                            linkedAbcEntryId,
                        }) => {
                            return {
                                replacementProgram: replacementProgram.name,
                                teachingProcedure: teachingProcedure?.name,
                                promptingProcedure: promptingProcedure?.name,
                                promptTypes: promptTypes
                                    .map(({ promptType }) => promptType?.name)
                                    .filter((name): name is string => !!name),
                                progress,
                                linkedAbcEntryId,
                            };
                        },
                    )
                    .map((entry) => ({
                        ...entry,
                        teachingProcedure: entry.teachingProcedure ?? '',
                        promptingProcedure: entry.promptingProcedure ?? '',
                    }));

            const getInitials = (first?: string | null, last?: string | null) =>
                `${first?.charAt(0) ?? ''}${last?.charAt(0) ?? ''}`;

            const userInitials = getInitials(
                clientSession.user.name,
                clientSession.user.lastName,
            );
            const clientInitials = getInitials(
                clientSession.client.firstName,
                clientSession.client.lastName,
            );

            const reinforcerNames = clientSession.reinforcers
                .map(({ reinforcer }) => reinforcer?.name)
                .filter((name): name is string => !!name);

            const sessionData: ClientSession = {
                ...clientSession,
                sessionDate: new Date(clientSession.sessionDate),
                presentParticipants: clientSession.participants.map(
                    (participant) => participant.name,
                ),
                environmentalChanges: clientSession.environmentalChanges.map(
                    (change) => change.name,
                ),
                abcEntries,
                replacementProgramEntries: replacementProgramEntries.map(
                    (entry) => ({
                        ...entry,
                        clientResponse: '',
                        progress: entry.progress ?? 0,
                    }),
                ),
                userInitials,
                clientInitials,
                reinforcerNames,
            };

            let text = '';

            const { data: generatedNotes, error: generatedNotesError } =
                await generateNotesProvider({
                    sessionData,
                    clientData,
                    userBasicData: {
                        firstName: clientSession.user.name,
                        lastName: clientSession.user.lastName,
                        language: clientSession.user.language ?? 'en',
                        userId: clientSession.user.id,
                    },
                    model: 'claude-3-7-sonnet-latest',
                });

            if (generatedNotesError === 'INSUFFICIENT_CREDITS')
                return Error(generatedNotesError);

            if (generatedNotesError) return Error();

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
                const { done, value: textDelta } = await generatedNotes.read();

                if (!done) text += textDelta;

                emit({
                    event: 'sessionNotesUpdated',
                    payload: {
                        sessionId,
                        notes: text,
                        isComplete: done,
                    },
                });

                if (done) break;
            }

            if (save) {
                await db
                    .update(clientSessionTable)
                    .set({
                        notes: text,
                    })
                    .where(eq(clientSessionTable.id, sessionId));
            }

            if (save) {
                await db
                    .update(clientSessionTable)
                    .set({
                        notes: text,
                    })
                    .where(eq(clientSessionTable.id, sessionId));
            }

            return Success();
        }),
    );
