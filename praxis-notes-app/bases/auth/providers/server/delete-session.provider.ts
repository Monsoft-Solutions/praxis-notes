import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { eq } from 'drizzle-orm';

import { db } from '@db/providers/server';

import { sessionTable } from '@db/db.tables';
import { catchError } from '@errors/utils/catch-error.util';

// Delete user session from DB
export const deleteSession = (async ({ sessionId }) => {
    const { error } = await catchError(
        db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
    );

    if (error) console.log('Error deleting session:', error);

    return Success();
}) satisfies Function<{ sessionId: string }, null>;
