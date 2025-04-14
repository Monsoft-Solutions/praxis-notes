import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { eq } from 'drizzle-orm';
import { clientSessionTable } from '@db/db.tables';
import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

// mutation to generate notes
export const updateNotes = protectedEndpoint
    .input(z.object({ sessionId: z.string(), notes: z.string() }))
    .mutation(
        queryMutationCallback(async ({ input: { sessionId, notes } }) => {
            const { error } = await catchError(
                db
                    .update(clientSessionTable)
                    .set({ notes })
                    .where(eq(clientSessionTable.id, sessionId)),
            );

            if (error) return Error();

            return Success();
        }),
    );
