import { v4 as uuidv4 } from 'uuid';

import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import {
    clientTable,
    clientBehaviorTable,
    clientReplacementProgramTable,
    clientInterventionTable,
    clientReplacementProgramBehaviorTable,
    clientBehaviorInterventionTable,
} from '@db/db.tables';

import { ClientFormData } from '@src/client/schemas';

export const createClient = (async ({
    clientId,
    user,
    clientFormData,
    isDraft,
}) => {
    const {
        firstName,
        lastName,
        gender,
        behaviors,
        replacementPrograms,
        interventions,
    } = clientFormData;

    const { error } = await catchError(
        db.insert(clientTable).values({
            id: clientId,
            organizationId: user.organizationId,
            createdBy: user.id,

            firstName,
            lastName,
            gender,

            isDraft,

            createdAt: Date.now(),
            updatedAt: Date.now(),
        }),
    );

    // if insertion failed, return the error
    if (error) {
        if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

        return Error();
    }

    const clientBehaviors = behaviors.map((behavior) => ({
        id: uuidv4(),
        clientId,
        behaviorId: behavior.id,
        type: behavior.type,
        baseline: behavior.baseline,
    }));

    for (const clientBehavior of clientBehaviors) {
        const { error: behaviorsError } = await catchError(
            db.insert(clientBehaviorTable).values({
                ...clientBehavior,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }),
        );

        if (behaviorsError) return Error();
    }

    for (const replacementProgram of replacementPrograms) {
        const clientReplacementProgramId = uuidv4();

        const { error: replacementProgramsError } = await catchError(
            db.insert(clientReplacementProgramTable).values({
                id: clientReplacementProgramId,
                clientId,
                replacementProgramId: replacementProgram.id,
            }),
        );

        if (replacementProgramsError) return Error();

        for (const behaviorId of replacementProgram.behaviorIds) {
            const { error: replacementProgramBehaviorsError } =
                await catchError(
                    db.insert(clientReplacementProgramBehaviorTable).values({
                        id: uuidv4(),
                        clientReplacementProgramId,
                        behaviorId,
                    }),
                );

            if (replacementProgramBehaviorsError) return Error();
        }
    }

    for (const intervention of interventions) {
        const clientInterventionId = uuidv4();

        const { error: interventionsError } = await catchError(
            db.insert(clientInterventionTable).values({
                id: clientInterventionId,
                clientId,
                interventionId: intervention.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }),
        );

        if (interventionsError) return Error();

        for (const behaviorId of intervention.behaviorIds) {
            const clientBehavior = clientBehaviors.find(
                (behavior) => behavior.behaviorId === behaviorId,
            );

            if (!clientBehavior) return Error();

            const { error: interventionBehaviorsError } = await catchError(
                db.insert(clientBehaviorInterventionTable).values({
                    id: uuidv4(),
                    clientInterventionId,
                    behaviorId,
                    createdAt: Date.now(),
                }),
            );

            if (interventionBehaviorsError) return Error();
        }
    }

    return Success();
}) satisfies Function<{
    clientId: string;
    user: { id: string; organizationId: string };
    clientFormData: ClientFormData;
    isDraft: boolean;
}>;
