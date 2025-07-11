import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { eq } from 'drizzle-orm';

import { serverQueryClient } from '@api/providers/server';

import { db } from '@db/providers/server';

import { UserCredits, userCreditsWithErrorSchema } from '../../schemas';

import { getUserCreditsFromDb } from './get-user-credits-from-db.provider';
import { userCreditsTable } from '../../db';
import { getUserCreditsQueryKey } from '../../utils';

// Set user credits
export const setUserCredits = (async ({ userId, credits }) => {
    const { error: updateError } = await catchError(
        db
            .update(userCreditsTable)
            .set(credits)
            .where(eq(userCreditsTable.userId, userId)),
    );

    if (updateError) {
        return Error('UPDATE_USER_CREDITS_ERROR');
    }

    // ensure custom conf cache is available
    await serverQueryClient.ensureQueryData({
        queryKey: getUserCreditsQueryKey({ userId }),

        queryFn: () => getUserCreditsFromDb({ userId }),
    });

    await serverQueryClient.setQueryData(
        getUserCreditsQueryKey({ userId }),

        (cacheData) => {
            const parsingCache =
                userCreditsWithErrorSchema.safeParse(cacheData);

            if (!parsingCache.success) {
                console.log(
                    `could not update corrupted custom conf cache: ${JSON.stringify(
                        cacheData,
                    )}`,
                );

                return cacheData;
            }

            const { data: cache } = parsingCache;

            const { error } = cache;

            if (error !== null) {
                console.log(
                    `could not update custom conf cache with error: ${cache.error}`,
                );

                return cacheData;
            }

            const { data } = cache;

            return Success(data);
        },
    );

    return Success();
}) satisfies Function<{ userId: string; credits: Partial<UserCredits> }>;
