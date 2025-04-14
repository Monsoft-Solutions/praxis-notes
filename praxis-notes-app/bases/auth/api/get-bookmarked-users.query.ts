import { Error, Success } from '@errors/utils';

import { db } from '@db/providers/server';

import { publicEndpoint } from '@api/providers/server';

import { deleteDuplicates } from '@shared/utils/delete-duplicates.util';
import { catchError } from '@errors/utils/catch-error.util';
import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

// Query to get the list of all bookmarked users: name, email, roles
export const getBookmarkedUsers = publicEndpoint.query(
    queryMutationCallback(async () => {
        const { data: queryResult, error } = await catchError(
            db.query.userTable.findMany({
                where: (user, { eq }) => eq(user.bookmarked, true),

                columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },

                with: {
                    authentications: {
                        columns: { email: true },
                    },

                    roles: {
                        columns: {},
                        with: {
                            role: {
                                columns: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        );

        if (error) return Error();

        const bookmarkedUsers = queryResult
            .map(({ id, firstName, lastName, authentications, roles }) => {
                const authentication = authentications.at(0);
                if (!authentication) return null;

                const roleNames = roles.map(({ role }) => role.name);

                const { data: dedupedRoleNames } = deleteDuplicates(roleNames);

                return {
                    id,
                    name: [firstName, lastName].filter(Boolean).join(' '),
                    email: authentication.email,
                    roles: dedupedRoleNames,
                };
            })
            .filter((user) => user !== null);

        return Success(bookmarkedUsers);
    }),
);
