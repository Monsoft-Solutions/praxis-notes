import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/_app/notes/')({
    // just redirect to main template view (template-management)
    component: () => <h1>Notes</h1>,
});
