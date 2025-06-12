import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { v4 as uuidv4 } from 'uuid';

import { emit } from '@events/providers';

import {
    clientSessionTable,
    clientSessionParticipantTable,
    clientSessionEnvironmentalChangeTable,
    clientSessionAbcEntryTable,
    clientSessionAbcEntryBehaviorTable,
    clientSessionAbcEntryInterventionTable,
    clientSessionReplacementProgramEntryTable,
    clientSessionReplacementProgramEntryPromptTypeTable,
    clientSessionReinforcerTable,
} from '../db';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { abcFunctionEnum, clientSessionValuationEnum } from '../enum';

import { replacementProgramResponseEnum } from '@src/replacement-program/enums';

import { eq } from 'drizzle-orm';
import { ClientSessionReplacementProgramEntry } from '../schemas/client-session-replacement-program-entry.schema';

// mutation to update a client session
export const updateClientSession = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
            sessionForm: z.object({
                location: z.string(),
                sessionDate: z.string(),
                startTime: z.string(),
                endTime: z.string(),

                valuation: clientSessionValuationEnum,
                observations: z.string().nullable(),

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

                replacementProgramEntries: z.array(
                    z.object({
                        replacementProgramId: z.string(),
                        teachingProcedureId: z.string().nullable(),
                        promptTypesIds: z.array(z.string()),
                        promptingProcedureId: z.string().nullable(),
                        clientResponse:
                            replacementProgramResponseEnum.nullable(),
                        progress: z.number().nullable(),
                        linkedAbcEntryIndex: z.number().nullable().optional(),
                    }),
                ),

                reinforcerIds: z.array(z.string()),
            }),
        }),
    )
    .mutation(
        queryMutationCallback(
            async ({
                // ctx: {
                //     // User will be needed later for permission checks
                //     session,
                // },
                input: { sessionId, sessionForm },
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
                    replacementProgramEntries,
                } = sessionForm;

                // Validate that the session exists
                const { data: existingSession, error: sessionError } =
                    await catchError(
                        db.query.clientSessionTable.findFirst({
                            where: (record) => eq(record.id, sessionId),
                        }),
                    );

                if (sessionError || !existingSession)
                    return Error('SESSION_NOT_FOUND');

                // Validate ABC entries
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

                // Validate replacement program entries
                // 1. Collect all unique IDs
                const allReplacementProgramIds = [
                    ...new Set(
                        replacementProgramEntries.map(
                            (entry) => entry.replacementProgramId,
                        ),
                    ),
                ];
                const allTeachingProcedureIds = [
                    ...new Set(
                        replacementProgramEntries.map(
                            (entry) => entry.teachingProcedureId,
                        ),
                    ),
                ].filter((id) => id !== null);
                const allPromptingProcedureIds = [
                    ...new Set(
                        replacementProgramEntries.map(
                            (entry) => entry.promptingProcedureId,
                        ),
                    ),
                ].filter((id) => id !== null);
                const allPromptTypeIds = [
                    ...new Set(
                        replacementProgramEntries.flatMap(
                            (entry) => entry.promptTypesIds,
                        ),
                    ),
                ];

                // 2. Bulk fetch records
                const [
                    replacementProgramsResult,
                    teachingProceduresResult,
                    promptingProceduresResult,
                    promptTypesResult,
                ] = await Promise.all([
                    catchError(
                        db.query.replacementProgramTable.findMany({
                            where: (record, { inArray }) =>
                                inArray(record.id, allReplacementProgramIds),
                        }),
                    ),
                    catchError(
                        db.query.teachingProcedureTable.findMany({
                            where: (record, { inArray }) =>
                                inArray(record.id, allTeachingProcedureIds),
                        }),
                    ),
                    catchError(
                        db.query.promptingProcedureTable.findMany({
                            where: (record, { inArray }) =>
                                inArray(record.id, allPromptingProcedureIds),
                        }),
                    ),
                    catchError(
                        db.query.promptTypeTable.findMany({
                            where: (record, { inArray }) =>
                                inArray(record.id, allPromptTypeIds),
                        }),
                    ),
                ]);

                // Handle potential errors during fetch
                if (
                    replacementProgramsResult.error ||
                    teachingProceduresResult.error ||
                    promptingProceduresResult.error ||
                    promptTypesResult.error
                ) {
                    console.error('Error fetching replacement program data');
                    return Error('DATABASE_FETCH_ERROR');
                }

                // 3. Create lookup maps
                const replacementProgramsMap = new Map(
                    replacementProgramsResult.data.map((p) => [p.id, p]),
                );
                const teachingProceduresMap = new Map(
                    teachingProceduresResult.data.map((p) => [p.id, p]),
                );
                const promptingProceduresMap = new Map(
                    promptingProceduresResult.data.map((p) => [p.id, p]),
                );
                const promptTypesMap = new Map(
                    promptTypesResult.data.map((p) => [p.id, p]),
                );

                // 4. Validate entries in memory and build note entries
                const validatedReplacementProgramNoteEntries: ClientSessionReplacementProgramEntry[] =
                    [];
                let allEntriesValid = true;

                for (const entry of replacementProgramEntries) {
                    const replacementProgram = replacementProgramsMap.get(
                        entry.replacementProgramId,
                    );
                    const teachingProcedure = entry.teachingProcedureId
                        ? teachingProceduresMap.get(entry.teachingProcedureId)
                        : undefined;
                    const promptingProcedure = entry.promptingProcedureId
                        ? promptingProceduresMap.get(entry.promptingProcedureId)
                        : undefined;
                    const promptTypes = entry.promptTypesIds
                        .map((id) => promptTypesMap.get(id))
                        .filter((pt): pt is NonNullable<typeof pt> => !!pt);

                    if (
                        !replacementProgram ||
                        promptTypes.length !== entry.promptTypesIds.length
                    ) {
                        allEntriesValid = false;
                        break; // Stop validation on first invalid entry
                    }

                    validatedReplacementProgramNoteEntries.push({
                        replacementProgram: replacementProgram.name,
                        teachingProcedure: teachingProcedure?.name ?? null,
                        promptingProcedure: promptingProcedure?.name ?? null,
                        promptTypes: promptTypes.map((pt) => pt.name),
                        clientResponse: entry.clientResponse,
                        progress: entry.progress,
                    });
                }

                if (!allEntriesValid) {
                    return Error('REPLACEMENT_PROGRAM_DATA_NOT_FOUND');
                }

                // Validate reinforcers
                const { data: reinforcers, error: reinforcersError } =
                    await catchError(
                        db.query.reinforcerTable.findMany({
                            where: (record, { inArray }) =>
                                inArray(record.id, sessionForm.reinforcerIds),
                        }),
                    );

                if (reinforcersError) {
                    return Error('DATABASE_FETCH_ERROR');
                }

                if (reinforcers.length !== sessionForm.reinforcerIds.length) {
                    return Error('REINFORCERS_NOT_FOUND');
                }

                // Update the client session with all its related data
                const { error } = await catchError(
                    db.transaction(async (tx) => {
                        // Update the main client session record
                        await tx
                            .update(clientSessionTable)
                            .set({
                                location,
                                sessionDate,
                                startTime,
                                endTime,
                                valuation,
                                observations,
                                // updatedAt is not needed as it might not be in the table schema
                            })
                            .where(eq(clientSessionTable.id, sessionId));

                        // Delete and recreate all related data

                        // 1. Delete participants
                        await tx
                            .delete(clientSessionParticipantTable)
                            .where(
                                eq(
                                    clientSessionParticipantTable.clientSessionId,
                                    sessionId,
                                ),
                            );

                        // 2. Delete environmental changes
                        await tx
                            .delete(clientSessionEnvironmentalChangeTable)
                            .where(
                                eq(
                                    clientSessionEnvironmentalChangeTable.clientSessionId,
                                    sessionId,
                                ),
                            );

                        // 3. Delete reinforcers
                        await tx
                            .delete(clientSessionReinforcerTable)
                            .where(
                                eq(
                                    clientSessionReinforcerTable.clientSessionId,
                                    sessionId,
                                ),
                            );

                        // 4. Delete ABC entries and their related behaviors and interventions
                        const { data: abcEntries } = await catchError(
                            tx.query.clientSessionAbcEntryTable.findMany({
                                where: (record) =>
                                    eq(record.clientSessionId, sessionId),
                            }),
                        );

                        if (abcEntries) {
                            for (const abcEntry of abcEntries) {
                                // Delete related behaviors
                                await tx
                                    .delete(clientSessionAbcEntryBehaviorTable)
                                    .where(
                                        eq(
                                            clientSessionAbcEntryBehaviorTable.clientSessionAbcEntryId,
                                            abcEntry.id,
                                        ),
                                    );

                                // Delete related interventions
                                await tx
                                    .delete(
                                        clientSessionAbcEntryInterventionTable,
                                    )
                                    .where(
                                        eq(
                                            clientSessionAbcEntryInterventionTable.clientSessionAbcEntryId,
                                            abcEntry.id,
                                        ),
                                    );
                            }

                            // Delete ABC entries
                            await tx
                                .delete(clientSessionAbcEntryTable)
                                .where(
                                    eq(
                                        clientSessionAbcEntryTable.clientSessionId,
                                        sessionId,
                                    ),
                                );
                        }

                        // 5. Delete replacement program entries and their prompt types
                        const { data: rpEntries } = await catchError(
                            tx.query.clientSessionReplacementProgramEntryTable.findMany(
                                {
                                    where: (record) =>
                                        eq(record.clientSessionId, sessionId),
                                },
                            ),
                        );

                        if (rpEntries) {
                            for (const rpEntry of rpEntries) {
                                // Delete related prompt types
                                await tx
                                    .delete(
                                        clientSessionReplacementProgramEntryPromptTypeTable,
                                    )
                                    .where(
                                        eq(
                                            clientSessionReplacementProgramEntryPromptTypeTable.clientSessionReplacementProgramEntryId,
                                            rpEntry.id,
                                        ),
                                    );
                            }

                            // Delete replacement program entries
                            await tx
                                .delete(
                                    clientSessionReplacementProgramEntryTable,
                                )
                                .where(
                                    eq(
                                        clientSessionReplacementProgramEntryTable.clientSessionId,
                                        sessionId,
                                    ),
                                );
                        }

                        // Insert new data

                        // 1. Insert participants
                        for (const participant of presentParticipants) {
                            await tx
                                .insert(clientSessionParticipantTable)
                                .values({
                                    id: uuidv4(),
                                    clientSessionId: sessionId,
                                    name: participant,
                                });
                        }

                        // 2. Insert environmental changes
                        for (const change of environmentalChanges) {
                            await tx
                                .insert(clientSessionEnvironmentalChangeTable)
                                .values({
                                    id: uuidv4(),
                                    clientSessionId: sessionId,
                                    name: change,
                                });
                        }

                        const newAbcIds = [];

                        // 3. Insert ABC entries
                        for (const {
                            antecedentId,
                            behaviorIds,
                            interventionIds,
                            function: abcFunction,
                        } of abcIdEntries) {
                            const clientSessionAbcEntryId = uuidv4();

                            await tx.insert(clientSessionAbcEntryTable).values({
                                id: clientSessionAbcEntryId,
                                clientSessionId: sessionId,
                                antecedentId,
                                function: abcFunction,
                            });

                            newAbcIds.push(clientSessionAbcEntryId);

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

                        // 4. Insert replacement program entries
                        for (const {
                            replacementProgramId,
                            teachingProcedureId,
                            promptingProcedureId,
                            clientResponse,
                            progress,
                            promptTypesIds,
                            linkedAbcEntryIndex,
                        } of replacementProgramEntries) {
                            const clientSessionReplacementProgramEntryId =
                                uuidv4();

                            const linkedAbcEntryId =
                                linkedAbcEntryIndex != null
                                    ? newAbcIds[linkedAbcEntryIndex]
                                    : null;

                            await tx
                                .insert(
                                    clientSessionReplacementProgramEntryTable,
                                )
                                .values({
                                    id: clientSessionReplacementProgramEntryId,
                                    clientSessionId: sessionId,
                                    replacementProgramId,
                                    teachingProcedureId,
                                    promptingProcedureId,
                                    clientResponse,
                                    progress,
                                    linkedAbcEntryId,
                                })
                                .catch((error: unknown) => {
                                    console.error(error);
                                    throw error;
                                });

                            for (const promptTypeId of promptTypesIds) {
                                await tx
                                    .insert(
                                        clientSessionReplacementProgramEntryPromptTypeTable,
                                    )
                                    .values({
                                        id: uuidv4(),
                                        clientSessionReplacementProgramEntryId,
                                        promptTypeId,
                                    })
                                    .catch((error: unknown) => {
                                        console.error(error);
                                        throw error;
                                    });
                            }
                        }

                        // 5. Insert reinforcers
                        for (const reinforcerId of sessionForm.reinforcerIds) {
                            await tx
                                .insert(clientSessionReinforcerTable)
                                .values({
                                    clientSessionId: sessionId,
                                    reinforcerId,
                                })
                                .catch((error: unknown) => {
                                    console.error(error);
                                    throw error;
                                });
                        }
                    }),
                );

                if (error) return Error();

                // emit a client-session-updated event
                emit({
                    event: 'sessionNotesUpdated',
                    payload: {
                        sessionId,
                        notes: '', // Empty string as we're not updating notes specifically
                        isComplete: true,
                    },
                });

                return Success({ id: sessionId });
            },
        ),
    );
