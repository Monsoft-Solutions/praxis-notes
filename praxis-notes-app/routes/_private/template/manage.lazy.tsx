import { createLazyFileRoute } from '@tanstack/react-router';

import { TemplateManagementView } from '@src/template/views/private';

// template-management view
export const Route = createLazyFileRoute('/_private/template/manage')({
    component: TemplateManagementView,
});
