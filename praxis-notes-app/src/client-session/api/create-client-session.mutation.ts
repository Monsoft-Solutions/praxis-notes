import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import {
    clientSessionTable,
    clientSessionParticipantTable,
    clientSessionEnvironmentalChangeTable,
    clientSessionAbcEntryTable,
} from '../db';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientSessionValuationEnum } from '../enum';

import { generateNotes as generateNotesProvider } from '@src/notes/providers/server';

import { eq } from 'drizzle-orm';

// mutation to create a client session
export const createClientSession = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),

            initNotes: z.boolean(),

            sessionForm: z.object({
                location: z.string(),
                sessionDate: z.string(),
                startTime: z.string(),
                endTime: z.string(),

                valuation: clientSessionValuationEnum,
                observations: z.string(),

                presentParticipants: z.array(z.string()),
                environmentalChanges: z.array(z.string()),

                abcIdEntries: z.array(
                    z.object({
                        antecedentId: z.string(),
                        clientBehaviorId: z.string(),
                        clientInterventionId: z.string(),
                    }),
                ),
            }),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { clientId, initNotes, sessionForm },
            }) => {
                const {
                    sessionDate,
                    startTime,
                    endTime,
                    location,
                    valuation,
                    observations,

                    presentParticipants,
                    environmentalChanges,

                    abcIdEntries,
                } = sessionForm;

                const abcEntriesNullable = await Promise.all(
                    abcIdEntries.map(
                        async ({
                            antecedentId,
                            clientBehaviorId,
                            clientInterventionId,
                        }) => {
                            const { data: antecedent, error: antecedentError } =
                                await catchError(
                                    db.query.antecedentTable.findFirst({
                                        where: (record) =>
                                            eq(record.id, antecedentId),
                                    }),
                                );

                            if (antecedentError || !antecedent) return null;

                            const {
                                data: clientBehavior,
                                error: clientBehaviorError,
                            } = await catchError(
                                db.query.clientBehaviorTable.findFirst({
                                    where: (record) =>
                                        eq(record.id, clientBehaviorId),
                                    with: {
                                        behavior: true,
                                    },
                                }),
                            );

                            if (clientBehaviorError || !clientBehavior)
                                return null;

                            const {
                                data: clientIntervention,
                                error: clientInterventionError,
                            } = await catchError(
                                db.query.clientInterventionTable.findFirst({
                                    where: (record) =>
                                        eq(record.id, clientInterventionId),
                                    with: {
                                        intervention: true,
                                    },
                                }),
                            );

                            if (clientInterventionError || !clientIntervention)
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
                    ),
                );

                const abcEntries = abcEntriesNullable.filter(
                    (abcEntry) => abcEntry !== null,
                );

                // generate a unique id for the client session
                const id = uuidv4();

                let notes: string | null = null;

                if (initNotes) {
                    const generateNotesResult = await generateNotesProvider({
                        ...sessionForm,
                        abcEntries,
                        sessionDate: new Date(sessionForm.sessionDate),
                    });

                    if (generateNotesResult.error)
                        return Error('TEXT_GENERATION_ERROR');

                    notes = generateNotesResult.data;
                }

                // create the client session object
                const clientSession = {
                    id,

                    userId: user.id,
                    clientId,

                    location,
                    sessionDate,
                    startTime,
                    endTime,

                    valuation,
                    observations,

                    notes,
                };

                // insert the client session into db
                const { error } = await catchError(
                    db.insert(clientSessionTable).values(clientSession),
                );

                // if insertion failed, return the error
                if (error) {
                    if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

                    return Error();
                }
                // otherwise...

                for (const participant of presentParticipants) {
                    const { error } = await catchError(
                        db.insert(clientSessionParticipantTable).values({
                            id: uuidv4(),
                            clientSessionId: id,
                            name: participant,
                        }),
                    );

                    if (error) return Error();
                }

                for (const change of environmentalChanges) {
                    const { error } = await catchError(
                        db
                            .insert(clientSessionEnvironmentalChangeTable)
                            .values({
                                id: uuidv4(),
                                clientSessionId: id,
                                name: change,
                            }),
                    );

                    if (error) return Error();
                }

                for (const {
                    antecedentId,
                    clientBehaviorId,
                    clientInterventionId,
                } of abcIdEntries) {
                    const { error } = await catchError(
                        db.insert(clientSessionAbcEntryTable).values({
                            id: uuidv4(),
                            clientSessionId: id,
                            antecedentId,
                            clientBehaviorId,
                            clientInterventionId,
                        }),
                    );

                    if (error) return Error();
                }

                return Success({ id });
            },
        ),
    );
