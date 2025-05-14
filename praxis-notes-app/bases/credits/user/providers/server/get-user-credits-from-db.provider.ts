import { v4 as uuidv4 } from 'uuid';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { UserCredits, userCreditsSchema } from '../../schemas';

import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';

import { userCreditsTable } from '../../db';

import { userCreditsMax } from '../../constants';

// Auxiliary function to get user credits from db, without caching
export const getUserCreditsFromDb = (async ({ userId }) => {
    const { data: userCreditsWithMetadata, error } = await catchError(
        db.transaction(async (tx) => {
            const userCredits = await tx.query.userCreditsTable.findFirst({
                where: (record, { eq }) => eq(record.userId, userId),
            });

            if (userCredits) return userCredits;

            return (
                await tx
                    .insert(userCreditsTable)
                    .values({
                        id: uuidv4(),
                        userId,

                        ...userCreditsMax,
                    })
                    .returning()
            )[0];
        }),
    );

    // if some error occurred while fetching the user credits
    if (error) return Error();

    const parsingUserCreditsWithoutMetadata = userCreditsSchema.safeParse(
        userCreditsWithMetadata,
    );

    if (!parsingUserCreditsWithoutMetadata.success)
        return Error('PARSING_USER_CREDITS');

    const { data } = parsingUserCreditsWithoutMetadata;

    return Success(data);
}) satisfies Function<{ userId: string }, UserCredits>;
