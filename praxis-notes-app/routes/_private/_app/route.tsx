import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AppLayout } from '@shared/views/app-layout.view';

import { Tour } from '@shared/components/tour.component';

// private routes
export const Route = createFileRoute('/_private/_app')({
    component: () => (
        <>
            <AppLayout>
                <Outlet />
            </AppLayout>

            <Tour />
        </>
    ),
});
