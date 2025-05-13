import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { eq } from 'drizzle-orm';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';

export const getClientSession = protectedEndpoint
    .input(
        z.object({
            sessionId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(
            async ({
                ctx: {
                    session: { user },
                },
                input: { sessionId },
            }) => {
                const { data: clientSessionRecord, error } = await catchError(
                    db.query.clientSessionTable.findFirst({
                        where: (record) => eq(record.id, sessionId),

                        with: {
                            client: true,
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
                                    promptTypes: {
                                        with: {
                                            promptType: true,
                                        },
                                    },
                                    promptingProcedure: true,
                                },
                            },
                            reinforcers: {
                                with: {
                                    reinforcer: true,
                                },
                            },
                        },
                    }),
                );

                if (error) return Error();

                if (!clientSessionRecord) return Error('NOT_FOUND');

                const abcEntriesNullable = clientSessionRecord.abcEntries.map(
                    ({
                        id,
                        antecedent,
                        behaviors: abcEntryBehaviors,
                        interventions: abcEntryInterventions,
                    }) => {
                        if (!antecedent) return null;

                        const behaviorsNullable = abcEntryBehaviors.map(
                            ({ behavior }) => behavior,
                        );

                        const behaviors = behaviorsNullable.filter(
                            (behavior) => behavior !== null,
                        );

                        if (behaviors.length !== abcEntryBehaviors.length)
                            return null;

                        const interventionsNullable = abcEntryInterventions.map(
                            ({ intervention }) => intervention,
                        );

                        const interventions = interventionsNullable.filter(
                            (intervention) => intervention !== null,
                        );

                        if (
                            interventions.length !==
                            abcEntryInterventions.length
                        )
                            return null;

                        return {
                            id,
                            antecedent,
                            behaviors,
                            interventions,
                        };
                    },
                );

                const abcEntries = abcEntriesNullable.filter(
                    (abcEntry) => abcEntry !== null,
                );

                const replacementProgramEntriesNullable =
                    clientSessionRecord.replacementProgramEntries.map(
                        ({
                            id,
                            replacementProgram,
                            teachingProcedure,
                            promptTypes: replacementProgramEntryPromptTypes,
                            promptingProcedure,
                            clientResponse,
                            progress,
                            linkedAbcEntryId,
                        }) => {
                            const promptTypesNullable =
                                replacementProgramEntryPromptTypes.map(
                                    ({ promptType }) => promptType,
                                );

                            const promptTypes = promptTypesNullable.filter(
                                (promptTypeName) => promptTypeName !== null,
                            );

                            if (
                                promptTypes.length !==
                                replacementProgramEntryPromptTypes.length
                            )
                                return null;

                            return {
                                id,
                                replacementProgram,
                                teachingProcedure,
                                promptTypes,
                                promptingProcedure,
                                clientResponse,
                                progress,
                                linkedAbcEntryId,
                            };
                        },
                    );

                const replacementProgramEntries =
                    replacementProgramEntriesNullable.filter(
                        (replacementProgramEntry) =>
                            replacementProgramEntry !== null,
                    );

                const reinforcersNullable = clientSessionRecord.reinforcers.map(
                    ({ reinforcer }) => reinforcer,
                );

                const reinforcers = reinforcersNullable.filter(
                    (reinforcer) => reinforcer !== null,
                );

                const { client } = clientSessionRecord;
                const clientSession = {
                    ...clientSessionRecord,
                    abcEntries,
                    replacementProgramEntries,
                    userInitials: `${user.name.at(0) ?? ''}${user.lastName?.at(0) ?? ''}`,
                    clientInitials: `${client.firstName.at(0) ?? ''}${client.lastName.at(0) ?? ''}`,
                    reinforcers,
                };

                return Success(clientSession);
            },
        ),
    );
