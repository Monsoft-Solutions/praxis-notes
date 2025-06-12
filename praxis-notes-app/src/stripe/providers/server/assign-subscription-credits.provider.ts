import { v4 as uuidv4 } from 'uuid';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';

import {
    getUserCredits,
    setUserCredits,
} from '../../../../bases/credits/user/providers/server';

import { userCreditTransactionsTable } from '../../db';

import type { TransactionType } from '../../enums';

/**
 * Assigns credits to a user based on their subscription
 *
 * @param userId - The user ID to assign credits to
 * @param stripePriceId - The Stripe price ID to determine credit amount
 * @param isNewSubscription - Whether this is a new subscription or a renewal
 * @returns Success() if credits were assigned, Error otherwise
 */
export const assignSubscriptionCredits = (async ({
    userId,
    stripePriceId,
    isNewSubscription = true,
}: {
    userId: string;
    stripePriceId: string;
    isNewSubscription?: boolean;
}) => {
    // 1. Query stripe_subscription_credits table for credit amount
    const { data: creditMapping, error: creditMappingError } = await catchError(
        db.query.stripeSubscriptionCreditsTable.findFirst({
            where: (record, { eq, and }) =>
                and(
                    eq(record.stripePriceId, stripePriceId),
                    eq(record.isActive, true),
                ),
        }),
    );

    if (creditMappingError) {
        return Error('CREDIT_MAPPING_QUERY_ERROR');
    }

    if (!creditMapping) {
        return Error('NO_CREDIT_MAPPING');
    }

    const { creditsAmount } = creditMapping;

    // 2. Get current user credits
    const { data: currentCredits, error: currentCreditsError } =
        await getUserCredits({ userId });

    if (currentCreditsError) {
        return Error('GET_USER_CREDITS_ERROR');
    }

    // 3. Calculate new credit amount
    let newCreditAmount: number;
    let transactionType: TransactionType;

    if (isNewSubscription) {
        // For new subscriptions, set credits to the plan amount
        newCreditAmount = creditsAmount;
        transactionType = 'subscription' as const;
    } else {
        // For renewals, add credits to existing balance
        newCreditAmount = currentCredits.generateNotes + creditsAmount;
        transactionType = 'subscription_renewal' as const;
    }

    // 4. Update user credits
    const { error: updateCreditsError } = await setUserCredits({
        userId,
        credits: { generateNotes: newCreditAmount },
    });

    if (updateCreditsError) {
        return Error('UPDATE_CREDITS_ERROR');
    }

    // 5. Log transaction
    const { error: transactionError } = await catchError(
        db.insert(userCreditTransactionsTable).values({
            id: uuidv4(),
            userId,
            transactionType,
            amount: creditsAmount,
            balanceAfter: newCreditAmount,
            description: `Credits assigned from ${isNewSubscription ? 'new subscription' : 'subscription renewal'} (${stripePriceId})`,
            metadata: JSON.stringify({ stripePriceId, isNewSubscription }),
            createdAt: Date.now(),
        }),
    );

    if (transactionError) {
        // Log error but don't fail the operation since credits were already updated
        console.error('Failed to log credit transaction:', transactionError);
    }

    return Success();
}) satisfies Function<{
    userId: string;
    stripePriceId: string;
    isNewSubscription?: boolean;
}>;
