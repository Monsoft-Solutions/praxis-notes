import { v4 as uuidv4 } from 'uuid';
import { reinforcerTable } from '../db/reinforcer.table';
import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

export const createReinforcerProvider = async (input: {
    name: string;
    organizationId: string;
}) => {
    const { name } = input;

    const reinforcerId = uuidv4();

    const { error } = await catchError(
        db.insert(reinforcerTable).values({
            id: reinforcerId,
            organizationId: input.organizationId,

            name,
        }),
    );

    // if insertion failed, return the error
    if (error) {
        if (error === 'DUPLICATE_ENTRY') return Error('DUPLICATE');

        return Error();
    }

    return Success({ id: reinforcerId });
};
