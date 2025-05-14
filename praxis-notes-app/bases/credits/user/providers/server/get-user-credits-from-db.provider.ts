import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { UserCredits, userCreditsSchema } from '../../schemas';

import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';

// Auxiliary function to get user credits from db, without caching
export const getUserCreditsFromDb = (async ({ userId }) => {
    const { data: userCreditsWithMetadata, error } = await catchError(
        db.query.userCreditsTable.findFirst({
            where: (record, { eq }) => eq(record.userId, userId),
        }),
    );

    // if some error occurred while fetching the user credits
    if (error) return Error();

    if (userCreditsWithMetadata === undefined) return Error('NO_USER_CREDITS');

    const parsingUserCreditsWithoutMetadata = userCreditsSchema.safeParse(
        userCreditsWithMetadata,
    );

    if (!parsingUserCreditsWithoutMetadata.success)
        return Error('PARSING_USER_CREDITS');

    const { data } = parsingUserCreditsWithoutMetadata;

    return Success(data);
}) satisfies Function<{ userId: string }, UserCredits>;
