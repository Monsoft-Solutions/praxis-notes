import { v4 as uuidv4 } from 'uuid';
import { interventionTable } from '@db/db.tables';
import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

export const createInterventionProvider = async (input: {
    name: string;
    description: string;
    organizationId: string;
}) => {
    const { name, description } = input;

    const interventionId = uuidv4();

    const { error } = await catchError(
        db.insert(interventionTable).values({
            id: interventionId,
            organizationId: input.organizationId,

            name,
            description,
        }),
    );

    // if insertion failed, return the error
    if (error) {
        if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

        return Error();
    }

    return Success({ id: interventionId });
};
