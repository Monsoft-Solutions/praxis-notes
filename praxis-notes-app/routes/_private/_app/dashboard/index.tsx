import { createFileRoute } from '@tanstack/react-router';
import { DashboardView } from '@src/dashboard';

export const Route = createFileRoute('/_private/_app/dashboard/')({
    component: DashboardView,
});
