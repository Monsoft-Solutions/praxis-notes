import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { eq } from 'drizzle-orm';

import { db } from '@db/providers/server';

import { organizationTable } from '@db/db.tables';
import { catchError } from '@errors/utils/catch-error.util';

// Delete user session from DB
export const deleteOrganization = (async ({ organizationId }) => {
    const { error } = await catchError(
        db
            .delete(organizationTable)
            .where(eq(organizationTable.id, organizationId)),
    );

    if (error) return Error();

    return Success();
}) satisfies Function<{ organizationId: string }, null>;
