import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { z } from 'zod';

import { db } from '@db/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { clientTable } from '@db/db.tables';
import { eq } from 'drizzle-orm';

// query to get a single client
export const getClient = protectedEndpoint
    .input(z.object({ clientId: z.string() }))
    .query(
        queryMutationCallback(async ({ input: { clientId } }) => {
            // get client from db
            const clients = await db
                .select()
                .from(clientTable)
                .where(eq(clientTable.id, clientId));

            if (clients.length === 0) return Error('NOT_FOUND');

            const client = clients[0];

            return Success(client);
        }),
    );
