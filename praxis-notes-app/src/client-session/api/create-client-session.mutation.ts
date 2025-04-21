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
    clientSessionAbcEntryBehaviorTable,
    clientSessionAbcEntryInterventionTable,
} from '../db';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { abcFunctionEnum, clientSessionValuationEnum } from '../enum';

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
                        behaviorIds: z.array(z.string()),
                        interventionIds: z.array(z.string()),
                        function: abcFunctionEnum,
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
                            behaviorIds,
                            interventionIds,
                        }) => {
                            const { data: antecedent, error: antecedentError } =
                                await catchError(
                                    db.query.antecedentTable.findFirst({
                                        where: (record) =>
                                            eq(record.id, antecedentId),
                                    }),
                                );

                            if (antecedentError || !antecedent) return null;

                            const { data: behaviors, error: behaviorsError } =
                                await catchError(
                                    db.transaction(async (tx) => {
                                        const behaviorsNullable =
                                            await Promise.all(
                                                behaviorIds.map(
                                                    async (behaviorId) =>
                                                        await tx.query.behaviorTable.findFirst(
                                                            {
                                                                where: (
                                                                    record,
                                                                ) =>
                                                                    eq(
                                                                        record.id,
                                                                        behaviorId,
                                                                    ),
                                                            },
                                                        ),
                                                ),
                                            );

                                        const behaviors =
                                            behaviorsNullable.filter(
                                                (behavior) =>
                                                    behavior !== undefined,
                                            );

                                        if (
                                            behaviors.length !==
                                            behaviorIds.length
                                        )
                                            throw 'BEHAVIORS_NOT_FOUND';

                                        return behaviors;
                                    }),
                                );

                            if (behaviorsError) return null;

                            const {
                                data: interventions,
                                error: interventionsError,
                            } = await catchError(
                                db.transaction(async (tx) => {
                                    const interventionsNullable =
                                        await Promise.all(
                                            interventionIds.map(
                                                async (interventionId) =>
                                                    await tx.query.interventionTable.findFirst(
                                                        {
                                                            where: (record) =>
                                                                eq(
                                                                    record.id,
                                                                    interventionId,
                                                                ),
                                                        },
                                                    ),
                                            ),
                                        );

                                    const interventions =
                                        interventionsNullable.filter(
                                            (intervention) =>
                                                intervention !== undefined,
                                        );

                                    if (
                                        interventions.length !==
                                        interventionIds.length
                                    )
                                        throw 'INTERVENTIONS_NOT_FOUND';

                                    return interventions;
                                }),
                            );

                            if (interventionsError) return null;

                            const antecedentName = antecedent.name;

                            const behaviorNames = behaviors.map(
                                (behavior) => behavior.name,
                            );
                            const interventionNames = interventions.map(
                                (intervention) => intervention.name,
                            );

                            return {
                                antecedentName,
                                behaviorNames,
                                interventionNames,
                            };
                        },
                    ),
                );

                const abcEntries = abcEntriesNullable.filter(
                    (abcEntry) => abcEntry !== null,
                );

                if (abcEntries.length !== abcIdEntries.length)
                    return Error('ABC_ENTRIES_NOT_FOUND');

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

                const { error } = await catchError(
                    db.transaction(async (tx) => {
                        // insert the client session
                        await tx
                            .insert(clientSessionTable)
                            .values(clientSession);

                        // insert the participants
                        for (const participant of presentParticipants) {
                            await tx
                                .insert(clientSessionParticipantTable)
                                .values({
                                    id: uuidv4(),
                                    clientSessionId: id,
                                    name: participant,
                                });
                        }

                        // insert the environmental changes
                        for (const change of environmentalChanges) {
                            await tx
                                .insert(clientSessionEnvironmentalChangeTable)
                                .values({
                                    id: uuidv4(),
                                    clientSessionId: id,
                                    name: change,
                                });
                        }

                        // insert the abc entries
                        for (const {
                            antecedentId,
                            behaviorIds,
                            interventionIds,
                            function: abcFunction,
                        } of abcIdEntries) {
                            const clientSessionAbcEntryId = uuidv4();

                            await tx.insert(clientSessionAbcEntryTable).values({
                                id: clientSessionAbcEntryId,
                                clientSessionId: id,
                                antecedentId,
                                function: abcFunction,
                            });

                            for (const behaviorId of behaviorIds) {
                                await tx
                                    .insert(clientSessionAbcEntryBehaviorTable)
                                    .values({
                                        id: uuidv4(),
                                        clientSessionAbcEntryId,
                                        behaviorId,
                                    });
                            }

                            for (const interventionId of interventionIds) {
                                await tx
                                    .insert(
                                        clientSessionAbcEntryInterventionTable,
                                    )
                                    .values({
                                        id: uuidv4(),
                                        clientSessionAbcEntryId,
                                        interventionId,
                                    });
                            }
                        }
                    }),
                );

                if (error) return Error();

                return Success({ id });
            },
        ),
    );
