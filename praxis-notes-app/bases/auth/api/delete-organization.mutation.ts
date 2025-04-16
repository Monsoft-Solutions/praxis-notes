import { Error, Success } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { deleteOrganization as deleteOrganizationProvider } from '../providers/server';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// delete a user's organization
export const deleteOrganization = protectedEndpoint.mutation(
    queryMutationCallback(async ({ ctx: { session } }) => {
        const { error } = await deleteOrganizationProvider({
            organizationId: session.user.organizationId,
        });

        if (error) return Error();

        return Success();
    }),
);
