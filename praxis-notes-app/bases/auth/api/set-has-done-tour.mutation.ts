import { eq } from 'drizzle-orm';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { db } from '@db/providers/server';
import { userTable } from '@auth/db';

// Mutation to set the hasDoneTour flag to true
export const setHasDoneTour = protectedEndpoint.mutation(
    queryMutationCallback(
        async ({
            ctx: {
                session: { user },
            },
        }) => {
            const { error } = await catchError(
                db
                    .update(userTable)
                    .set({ hasDoneTour: true })
                    .where(eq(userTable.id, user.id)),
            );

            if (error) return Error();

            return Success();
        },
    ),
);
