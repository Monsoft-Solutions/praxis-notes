import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { Success } from '@errors/utils/success.util';
import { Error } from '@errors/utils/error.util';
import { eq } from 'drizzle-orm';
import { ClientAbaData } from '@src/client-session/schemas/client-aba-data.schema';

export const getClientAbaData = async (clientId: string) => {
    // Directly fetch additional client data from the database instead of using the client API

    // Fetch behaviors
    const { data: behaviors, error: behaviorsError } = await catchError(
        db.query.clientBehaviorTable.findMany({
            where: (record) => eq(record.clientId, clientId),
            with: {
                behavior: true,
            },
        }),
    );

    if (behaviorsError) return Error();

    // Fetch interventions
    const { data: interventions, error: interventionsError } = await catchError(
        db.query.clientInterventionTable.findMany({
            where: (record) => eq(record.clientId, clientId),
            with: {
                intervention: true,
                behaviors: {
                    with: {
                        clientBehavior: true,
                    },
                },
            },
        }),
    );

    if (interventionsError)
        return Error('Failed to fetch client interventions');

    // Fetch replacement programs
    const { data: replacementPrograms, error: replacementProgramsError } =
        await catchError(
            db.query.clientReplacementProgramTable.findMany({
                where: (record) => eq(record.clientId, clientId),
                with: {
                    replacementProgram: true,
                    behaviors: {
                        with: {
                            clientBehavior: {
                                with: {
                                    behavior: true,
                                },
                            },
                        },
                    },
                },
            }),
        );

    if (replacementProgramsError)
        return Error('Failed to fetch client replacement programs');

    // Format the behaviors for client consumption
    const clientBehaviors = behaviors.map((clientBehavior) => {
        const { name, description, organizationId } = clientBehavior.behavior;
        return {
            id: clientBehavior.id,
            name,
            description,
            isCustom: organizationId !== null,
            baseline: clientBehavior.baseline,
            type: clientBehavior.type,
            behaviorId: clientBehavior.behaviorId,
        };
    });

    // Format the interventions for client consumption
    const clientInterventions = interventions.map((clientIntervention) => {
        const { name, description, organizationId } =
            clientIntervention.intervention;
        return {
            id: clientIntervention.id,
            name,
            description,
            isCustom: organizationId !== null,
            interventionId: clientIntervention.interventionId,
            behaviors: clientIntervention.behaviors.map(
                (clientBehaviorIntervention) =>
                    clientBehaviorIntervention.clientBehavior.behaviorId,
            ),
        };
    });

    // Format the replacement programs for client consumption
    const clientReplacementPrograms = replacementPrograms.map(
        ({ replacementProgram, behaviors }) => {
            const { name, description, organizationId } = replacementProgram;
            return {
                id: replacementProgram.id,
                name,
                description,
                isCustom: organizationId !== null,
                behaviorIds: behaviors.map(
                    (behavior) => behavior.clientBehavior.behavior.id,
                ),
            };
        },
    );

    // Create client data object
    const clientData = {
        behaviors: clientBehaviors,
        replacementPrograms: clientReplacementPrograms,
        interventions: clientInterventions,
    } as ClientAbaData;

    return Success(clientData);
};
