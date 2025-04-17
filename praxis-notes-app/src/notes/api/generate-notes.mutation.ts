import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { generateNotes as generateNotesProvider } from '../providers/server/generate-notes.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

// mutation to generate notes
export const generateNotes = protectedEndpoint
    .input(z.object({ sessionId: z.string() }))
    .mutation(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            const { data: clientSession, error } = await catchError(
                db.query.clientSessionTable.findFirst({
                    where: (record) => eq(record.id, sessionId),

                    with: {
                        participants: true,
                        environmentalChanges: true,
                        abcEntries: {
                            with: {
                                antecedent: true,
                                clientBehavior: {
                                    with: {
                                        behavior: true,
                                    },
                                },
                                clientIntervention: {
                                    with: {
                                        intervention: true,
                                    },
                                },
                            },
                        },
                    },
                }),
            );

            if (error) return Error();

            if (!clientSession) return Error('NOT_FOUND');

            const abcEntriesNullable = clientSession.abcEntries.map(
                ({ antecedent, clientBehavior, clientIntervention }) => {
                    if (!antecedent || !clientBehavior || !clientIntervention)
                        return null;

                    const antecedentName = antecedent.name;
                    const behaviorName = clientBehavior.behavior.name;
                    const interventionName =
                        clientIntervention.intervention.name;

                    return {
                        antecedentName,
                        behaviorName,
                        interventionName,
                    };
                },
            );

            const abcEntries = abcEntriesNullable.filter((abc) => abc !== null);

            const sessionData = {
                ...clientSession,
                sessionDate: new Date(clientSession.sessionDate),
                presentParticipants: clientSession.participants.map(
                    (participant) => participant.name,
                ),
                environmentalChanges: clientSession.environmentalChanges.map(
                    (change) => change.name,
                ),
                abcEntries,
            };

            const { data: generatedNotes, error: generatedNotesError } =
                await generateNotesProvider(sessionData);

            if (generatedNotesError) return Error();

            return Success(generatedNotes);
        }),
    );
