import { publicEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { createSession, validateAuthentication } from '../providers/server';

import { logInCredentialsSchema } from '@auth/schemas';
import { Error, Success } from '@errors/utils';

// Mutation to log in a user (create session on DB)
// Input: authentication credentials (email, password)
// Output: created session (null if invalid credentials)
export const logIn = publicEndpoint.input(logInCredentialsSchema).mutation(
    queryMutationCallback(async ({ input: { email, password } }) => {
        const { data: user, error: userError } = await validateAuthentication({
            email,
            password,
        });

        if (userError === 'INVALID_CREDENTIALS') return Error(userError);

        if (userError) return Error();

        const { userId } = user;

        const { data: session, error } = await createSession({ userId });

        if (error) return Error();

        const { id: sessionId } = session;

        return Success(sessionId);
    }),
);
