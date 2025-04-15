import { Success } from '@errors/utils';

import { publicEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Query to get the current session based on auth header
export const getLoggedInUser = publicEndpoint.query(
    queryMutationCallback(({ ctx: { session } }) => {
        // if no active session found with requested session id
        // return null
        if (!session) return Success(null);

        // otherwise, return the user object
        const { user } = session;

        return Success(user);
    }),
);
