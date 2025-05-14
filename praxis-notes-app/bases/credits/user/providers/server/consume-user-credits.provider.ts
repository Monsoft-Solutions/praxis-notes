import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { UserCreditsBucket } from '../../types';

import { getUserCredits, setUserCredits } from '.';

/**
 * Consumes tokens from a user's bucket
 *
 * @param userId - The ID of the user
 * @param bucketType - The type of bucket to consume from
 * @param amount - The number of tokens to consume
 * @param callback - A function to call if enough available tokens
 * @returns Success(true) if tokens were consumed, Error('INSUFFICIENT_TOKENS') if not enough tokens
 */

export const consumeUserCredits = (async <T>({
    userId,
    bucketType,
    amount,
    callback,
}: {
    userId: string;
    bucketType: UserCreditsBucket;
    amount: number;
    callback: Function<void, T>;
}) => {
    // Get user's current credits
    const { data: userCreditsData, error: userCreditsError } =
        await getUserCredits({ userId });

    if (userCreditsError) {
        return Error('USER_CREDITS_ERROR');
    }

    // Check if the bucket exists and has enough tokens
    const bucketValue = userCreditsData[bucketType];

    if (bucketValue < amount) {
        return Error('INSUFFICIENT_CREDITS');
    }

    // Update user credits by subtracting the consumed amount
    const { error: updateError } = await setUserCredits({
        userId,
        credits: {
            [bucketType]: bucketValue - amount,
        },
    });

    if (updateError) {
        return Error('UPDATE_CREDITS_ERROR');
    }

    const { data: callbackData, error: callbackError } = await callback();

    if (callbackError) {
        await setUserCredits({
            userId,
            credits: {
                [bucketType]: bucketValue,
            },
        });

        return Error('CALLBACK_ERROR');
    }

    return Success(callbackData as T);
}) satisfies Function<{
    userId: string;
    bucketType: UserCreditsBucket;
    amount: number;
    callback: Function;
}>;
