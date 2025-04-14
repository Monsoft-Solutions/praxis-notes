import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { ReactElement } from 'react';

import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';

import { apiClientUtils, vanillaApi } from '@api/providers/web';

import { LogInCredentials } from '@auth/schemas';

import {
    getWebSessionId,
    setWebSessionId,
    removeWebSessionId,
    isWebSessionIdAvailable,
} from '@auth/providers/web';
import { router } from '@web/router';
import { toast } from 'sonner';

import { User } from '@guard/types';

// show devtools only in development
const showDevTools = process.env.NODE_ENV === 'development';

// log-in method
const logIn = async (credentials: LogInCredentials) => {
    // create server-side (db) session
    const logInResult = await vanillaApi.auth.logIn.mutate(credentials);

    const { error } = logInResult;

    // if invalid credentials
    if (error === 'INVALID_CREDENTIALS') {
        toast.error('Invalid username or password', {
            description: 'Please check your credentials and try again',
        });
        return false;
    }
    // otherwise...

    // check if session failed (e.g. wrong credentials)
    if (error) {
        toast.error('Something went wrong', {
            description: 'Unexpected error ocurred, please try again',
        });
        return false;
    }
    // otherwise...

    const { data: sessionId } = logInResult;

    // store the id of the created session
    // on the browser session storage
    setWebSessionId({ sessionId });

    // remove previous session cache if any
    await apiClientUtils.auth.getLoggedInUser.reset();

    // invalidate the whole router
    // rerunning loader/beforLoad for all routes
    // to update route permission guards
    await router.invalidate();

    return true;
};

// log-out method
const logOut = async () => {
    // remove server-side (db) session
    await vanillaApi.auth.logOut.mutate();

    // remove the id of the current session
    // from the browser session storage
    removeWebSessionId();

    // invalidate the whole router
    // rerunning loader/beforLoad for all routes
    // to update route permission guards
    await router.invalidate();
};

const getLoggedInUser = (async () => {
    const { data: webSessionIdAvailable } = isWebSessionIdAvailable();

    if (!webSessionIdAvailable) return Success(null);

    // get the id of the current session
    // from the browser session storage
    const { data: sessionId, error: webSessionIdError } = getWebSessionId();

    if (webSessionIdError) return Error(webSessionIdError);

    // if no session id found
    // consider no active session
    if (!sessionId) return Error('SESSION_ID_NOT_FOUND');
    // otherwise...

    // retrive the session object
    // cache to avoid delais on router invalidations
    const { data: user } =
        await apiClientUtils.auth.getLoggedInUser.ensureData();

    return Success(user);
}) satisfies Function<void, User | null>;

export const Route = createRootRoute({
    beforeLoad: () => {
        // provide auth methods as router context
        return {
            auth: {
                getLoggedInUser,
                logIn,
                logOut,
            },
        };
    },

    component: function View(): ReactElement {
        return (
            <>
                {/* just render the matched children route */}
                <Outlet />

                {/* development tools for router and query engines */}
                {/* not rendered on production builds */}
                {showDevTools && (
                    <>
                        <ReactQueryDevtools
                            position="bottom"
                            buttonPosition="bottom-right"
                        />

                        <TanStackRouterDevtools />
                    </>
                )}
            </>
        );
    },
});
