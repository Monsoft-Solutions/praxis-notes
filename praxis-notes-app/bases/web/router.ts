import { createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import { NotFoundView } from '@shared/views/not-found.view';

// create router instance
export const router = createRouter({
    // route tree
    routeTree,

    // default preload strategy
    defaultPreload: 'intent',

    defaultNotFoundComponent: NotFoundView,
});

declare module '@tanstack/react-router' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface Register {
        router: typeof router;
    }
}
