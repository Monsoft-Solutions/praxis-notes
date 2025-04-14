import { createFileRoute } from '@tanstack/react-router';

// public routes
export const Route = createFileRoute('/_public')({
    beforeLoad: async ({
        context: {
            auth: { getLoggedInUser },
        },
    }) => {
        // get logged-in user
        // or null if not logged-in
        const { data: loggedInUserData, error: loggedInUserError } =
            await getLoggedInUser();

        // if logged-in user could not be obtained
        // treat as not logged-in
        const loggedInUser =
            loggedInUserError === null ? loggedInUserData : null;

        // add logged-in user (possibly null) to router context
        return { loggedInUser };
    },
});
