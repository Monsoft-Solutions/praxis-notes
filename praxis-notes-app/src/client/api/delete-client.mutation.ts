import { z } from 'zod';

import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientTable } from '@db/db.tables';

import { eq } from 'drizzle-orm';

export const deleteClient = protectedEndpoint
    .input(z.object({ id: z.string() }))
    .mutation(
        queryMutationCallback(async ({ input: { id } }) => {
            const { error } = await catchError(
                db.delete(clientTable).where(eq(clientTable.id, id)),
            );

            if (error) return Error();

            return Success();
        }),
    );
