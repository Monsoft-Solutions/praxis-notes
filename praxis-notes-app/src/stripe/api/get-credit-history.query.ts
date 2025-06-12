import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { eq } from 'drizzle-orm';

// Query to get the credit transaction history for the current user
export const getCreditHistory = protectedEndpoint.query(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            // Get the user's credit transaction history
            const { data: transactions, error } = await catchError(
                db.query.userCreditTransactionsTable.findMany({
                    where: (record) => eq(record.userId, user.id),
                    orderBy: (record, { desc }) => [desc(record.createdAt)],
                    limit: 50,
                }),
            );

            if (error) return Error();

            // Return the transaction history
            return Success(transactions);
        },
    ),
);
