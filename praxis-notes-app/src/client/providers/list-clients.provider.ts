import { db } from '@db/providers/server';
import { eq } from 'drizzle-orm';
import { clientTable } from '@db/db.tables';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

export const listClients = (async ({ userId }: { userId: string }) => {
    const { data: clients, error: clientsError } = await catchError(
        db.query.clientTable.findMany({
            where: eq(clientTable.createdBy, userId),
            columns: {
                id: true,
                firstName: true,
                lastName: true,
                isActive: true,
            },
        }),
    );

    if (clientsError) return Error();

    return Success(clients);
}) satisfies Function<
    { userId: string },
    {
        id: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
    }[]
>;
