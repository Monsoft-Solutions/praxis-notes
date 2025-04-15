import { endpoint } from './endpoint.provider';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { validateSession } from '@auth/providers/server';

import { User } from '@guard/types';

const getNextContextSession = (async ({ session: previousContextSession }) => {
    if (!previousContextSession) return Success(null);

    const { id: sessionId } = previousContextSession;

    const { data: validatedSession, error: sessionError } =
        await validateSession({
            sessionId,
        });

    if (sessionError) return Error(sessionError);

    if (validatedSession === null) return Success(null);

    const { user } = validatedSession;

    const newContextSession = {
        id: sessionId,
        user,
    };

    return Success(newContextSession);
}) satisfies Function<
    { session: { id: string } | null },
    {
        id: string;
        user: User;
    } | null
>;

// Utility to create a public tRPC endpoint
export const publicEndpoint = endpoint.use(
    async ({ ctx: { session }, next }) => {
        const { data: nextContextSession, error: nextContextSessionError } =
            await getNextContextSession({
                session,
            });

        const newContextSession = nextContextSessionError
            ? null
            : nextContextSession;

        return next({
            ctx: { session: newContextSession },
        });
    },
);
