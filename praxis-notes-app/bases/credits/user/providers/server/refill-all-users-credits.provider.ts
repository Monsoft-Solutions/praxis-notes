import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { db } from '@db/providers/server';

import { userCreditsTable } from '../../db';

import { refillAllBuckets } from './refill-user-credits.provider';

/**
 * Refills all buckets for all users to their maximum capacity
 */
export const refillAllUserBuckets = (async () => {
    // Get all users who have credit records
    const usersWithCredits = await db
        .select({
            userId: userCreditsTable.userId,
        })
        .from(userCreditsTable);

    for (const { userId } of usersWithCredits) {
        const { error: userRefillError } = await refillAllBuckets({ userId });

        if (userRefillError) {
            console.error(
                `Failed to refill buckets for user ${userId}: ${userRefillError}`,
            );

            return Error('REFILL_ALL_USER_CREDITS_ERROR');
        }
    }

    return Success();
}) satisfies Function;
