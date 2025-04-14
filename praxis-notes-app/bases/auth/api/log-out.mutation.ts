import { Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { deleteSession } from '../providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Mutation to log out a user (delete session from DB)
export const logOut = protectedEndpoint.mutation(
    queryMutationCallback(async ({ ctx: { session } }) => {
        await deleteSession({ sessionId: session.id });

        return Success();
    }),
);
