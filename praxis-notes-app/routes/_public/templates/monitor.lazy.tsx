import { createLazyFileRoute } from '@tanstack/react-router';

import { TemplatesMonitorView } from '@src/template/views/public';

// templates-monitoring view
export const Route = createLazyFileRoute('/_public/templates/monitor')({
    component: TemplatesMonitorView,
});
