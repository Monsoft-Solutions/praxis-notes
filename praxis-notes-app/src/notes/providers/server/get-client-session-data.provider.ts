import { db } from '@db/providers/server/db-client.provider';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils/success.util';
import { Error } from '@errors/utils/error.util';
import { ClientSession } from '@src/client-session/schemas/client-session.schema';
import { getClientAbaData } from '@src/client/providers/get-client-aba-data.provider';
import { eq } from 'drizzle-orm';

export const getClientSessionData = async (sessionId: string) => {
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
        ({
            antecedent,
            behaviors,
            interventions,
            id,
            function: abcEntryFunction,
        }) => {
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

            if (interventionNames.length !== interventions.length) return null;

            return {
                antecedentName,
                behaviorNames,
                interventionNames,
                id,
                function: abcEntryFunction,
            };
        },
    );

    const abcEntries = abcEntriesNullable.filter((abc) => abc !== null);

    const replacementProgramEntries = clientSession.replacementProgramEntries
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
        replacementProgramEntries: replacementProgramEntries.map((entry) => ({
            ...entry,
            clientResponse: '',
            progress: entry.progress ?? 0,
        })),
        userInitials,
        clientInitials,
        reinforcerNames,
    };

    const { data: clientData, error: clientDataError } = await getClientAbaData(
        clientSession.client.id,
    );

    if (clientDataError) return Error();

    return Success({ sessionData, clientData, userData: clientSession.user });
};
