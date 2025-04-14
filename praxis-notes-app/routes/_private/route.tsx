import { createFileRoute, redirect } from '@tanstack/react-router';

// private routes
export const Route = createFileRoute('/_private')({
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

        // if no active session (not logged-in), block access
        if (loggedInUser === null)
            // this error is catched by the router,
            // causing client-side redirect
            throw redirect({
                // redirect to log-in view
                to: '/auth/log-in',

                // include return-to path
                // used to redirect the user back to currect view
                // once successfully logged-in
                search: { returnTo: location.pathname },
            });

        // if active session found (logged-in), allow access
        // and add logged-in user to router context
        return { loggedInUser };
    },
});
