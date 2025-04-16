import { createFileRoute, redirect } from '@tanstack/react-router';

import { z } from 'zod';

import { toast } from 'sonner';

import { vanillaApi } from '@api/providers/web';

import { EmailVerificationFailedView } from '@shared/views/email-verification-failed.view';

// ----------------------------------------------------------------------

const validateSearch = z.object({
    // path to return to after successful log-in
    id: z.string(),
});

export const Route = createFileRoute('/_public/auth/verify-email')({
    validateSearch,

    beforeLoad: async (ctx) => {
        const { error } = await vanillaApi.auth.verifyEmail.mutate({
            id: ctx.search.id,
        });

        if (!error) {
            toast.success('Email verified successfully', {
                description: 'You can now log in to your account',
            });

            throw redirect({ to: '/auth/log-in' });
        }
    },

    component: EmailVerificationFailedView,
});
