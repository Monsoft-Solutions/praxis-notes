import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { setUserCredits } from '.';

import { userCreditsMax } from '../../constants';

/**
 * Refills all buckets to their maximum values for a user
 *
 * @param userId - The ID of the user
 * @returns Success() if all buckets were reset, Error otherwise
 */
export const refillAllBuckets = (async ({ userId }: { userId: string }) => {
    // Create an object with all buckets set to their maximum values

    // Update all credits at once
    const updateResult = await setUserCredits({
        userId,
        credits: userCreditsMax,
    });

    if (updateResult.error) {
        return Error('UPDATE_CREDITS_ERROR');
    }

    return Success();
}) satisfies Function<{ userId: string }>;
