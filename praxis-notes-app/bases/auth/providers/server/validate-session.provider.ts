import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { and, eq, gt } from 'drizzle-orm';

import { db } from '@db/providers/server';

import { catchError } from '@errors/utils/catch-error.util';

// Validate user session
// Check it exists on DB and is not expired
export const validateSession = (async ({ sessionId }) => {
    const { data: session, error } = await catchError(
        db.query.sessionTable.findFirst({
            where: (auth) =>
                and(eq(auth.id, sessionId), gt(auth.expiresAt, Date.now())),

            with: {
                user: {
                    with: {
                        roles: {
                            with: {
                                role: true,
                            },
                        },
                    },
                },
            },
        }),
    );

    // if some error occurred while fetching the session
    if (error) return Error();
    // otherwise...

    // ifsession does not exist, or is expired
    if (session === undefined) return Error('NOT_FOUND');
    // otherwise...

    const {
        user: { id: userId, organizationId, roles: userRoles },
    } = session;

    const validatedSession = {
        user: {
            id: userId,
            organizationId,
            roles: userRoles.map((userRole) => userRole.role.name),
        },
    };

    return Success(validatedSession);
}) satisfies Function<
    { sessionId: string },
    {
        user: {
            id: string;
            organizationId: string;
            roles: string[];
        };
    }
>;
