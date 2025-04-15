import { z } from 'zod';

import { createFileRoute, redirect } from '@tanstack/react-router';

import { toast } from 'sonner';

import { apiClientUtils } from '@api/providers/web';

import { LogInView } from '@shared/views/log-in.view';

// ----------------------------------------------------------------------

// log-in view search schema
const validateSearch = z.object({
    // path to return to after successful log-in
    returnTo: z.string().catch('/'),
});

export const Route = createFileRoute('/_public/auth/log-in')({
    validateSearch,

    beforeLoad({ context: { loggedInUser }, search: { returnTo } }) {
        // if not logged-in, don't do anything here
        if (!loggedInUser) return;
        // otherwise...

        // get clean return-to path, without trailing `?`
        const returnToClean =
            returnTo.at(-1) === '?' ? returnTo.slice(0, -1) : returnTo;

        // redirect to return-to path
        throw redirect({ to: returnToClean });
    },

    // loader only runs if beforeLoad doesn't throw redirect
    loader: async () => {
        // retrive bookmarked users
        const bookmarkedUsersResult =
            await apiClientUtils.auth.getBookmarkedUsers.ensureData();

        const { error } = bookmarkedUsersResult;

        if (error) {
            toast.error('Failed to retrieve bookmarked users');

            return { bookmarkedUsers: null };
        }

        const { data: bookmarkedUsers } = bookmarkedUsersResult;

        // add bookmarked users to route loader data
        return { bookmarkedUsers };
    },

    component: LogInView,
});
