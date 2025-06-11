import { v4 as uuidv4 } from 'uuid';
import { behaviorTable } from '@db/db.tables';
import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { Error, Success } from '@errors/utils';

export const createBehaviorProvider = async (input: {
    name: string;
    description: string;
    organizationId: string;
}) => {
    const { name, description } = input;

    const behaviorId = uuidv4();

    const { error } = await catchError(
        db.insert(behaviorTable).values({
            id: behaviorId,
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

    return Success({ id: behaviorId });
};
