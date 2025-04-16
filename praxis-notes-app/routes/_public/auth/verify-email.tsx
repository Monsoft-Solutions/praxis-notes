import { createFileRoute } from '@tanstack/react-router';

import { VerifyEmailView } from '@shared/views/verify-email.view';

import { z } from 'zod';

// ----------------------------------------------------------------------

const validateSearch = z.object({
    // path to return to after successful log-in
    id: z.string(),
});

export const Route = createFileRoute('/_public/auth/verify-email')({
    validateSearch,

    component: VerifyEmailView,
});
