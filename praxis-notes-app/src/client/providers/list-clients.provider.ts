import { db } from '@db/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { eq } from 'drizzle-orm';
import { clientTable } from '@db/db.tables';
import { Success } from '@errors/utils/success.util';

export const listClients = async (userId: string) => {
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
};
