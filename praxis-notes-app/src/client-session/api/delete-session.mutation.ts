import { Error, Success } from '@errors/utils';
import { protectedEndpoint } from '@api/providers/server';
import { z } from 'zod';
import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';
import { clientSessionTable } from '../db';
import { eq } from 'drizzle-orm';

export const deleteClientSession = protectedEndpoint
    .input(z.object({ sessionId: z.string() }))
    .mutation(
        queryMutationCallback(async ({ input: { sessionId } }) => {
            // delete the session from db
            const { error } = await catchError(
                db
                    .delete(clientSessionTable)
                    .where(eq(clientSessionTable.id, sessionId)),
            );

            // if deletion failed, return the error
            if (error) {
                return Error();
            }

            return Success();
        }),
    );
