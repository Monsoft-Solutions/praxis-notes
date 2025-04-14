import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Query to get the current session based on auth header
export const getLoggedInUser = protectedEndpoint.query(
    queryMutationCallback(({ ctx: { session } }) => {
        const { user } = session;

        return Success(user);
    }),
);
