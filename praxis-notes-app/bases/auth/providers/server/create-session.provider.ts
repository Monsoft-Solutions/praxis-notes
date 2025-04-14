import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { v4 as uuidv4 } from 'uuid';

import { db } from '@db/providers/server';

import { sessionTable } from '@db/db.tables';
import { catchError } from '@errors/utils/catch-error.util';

// Session duration in milliseconds
const sessionDuration = 24 * 60 * 60 * 1000; // 1 day

// Create user session on DB
export const createSession = (async ({ userId }) => {
    const id = uuidv4();

    const { error } = await catchError(
        db.insert(sessionTable).values({
            id,
            userId,
            expiresAt: Date.now() + sessionDuration,
        }),
    );

    if (error) return Error();

    const session = { id };

    return Success(session);
}) satisfies Function<{ userId: string }, { id: string }>;
