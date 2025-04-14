import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AdminLayout } from '@shared/views/admin-layout';

// private routes
export const Route = createFileRoute('/_private/_app/_admin')({
    component: () => (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    ),
});
