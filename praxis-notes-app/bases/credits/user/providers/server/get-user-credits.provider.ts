import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { serverQueryClient } from '@api/providers/server';

import { UserCredits, userCreditsWithErrorSchema } from '../../schemas';

import { getUserCreditsFromDb } from './get-user-credits-from-db.provider';

import { getUserCreditsQueryKey } from '../../utils';

// Get Custom configuration
export const getUserCredits = (async ({ userId }) => {
    const cache = await serverQueryClient.ensureQueryData({
        queryKey: getUserCreditsQueryKey({ userId }),

        queryFn: () => getUserCreditsFromDb({ userId }),

        staleTime: 10000,
        gcTime: 20000,

        revalidateIfStale: true,
    });

    const parsingCache = userCreditsWithErrorSchema.safeParse(cache);

    if (!parsingCache.success) return Error('PARSING_CACHE');

    const { data: cacheData, error: cacheError } = cache;

    if (cacheError) return Error('CACHE_ERROR');

    return Success(cacheData);
}) satisfies Function<{ userId: string }, UserCredits>;
