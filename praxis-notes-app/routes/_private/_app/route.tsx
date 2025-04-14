import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AppLayout } from '@shared/views/app-layout';

// private routes
export const Route = createFileRoute('/_private/_app')({
    component: () => (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ),
});
