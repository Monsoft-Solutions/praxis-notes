import { ReactElement, useEffect } from 'react';

import { toast } from 'sonner';

import { api } from '@api/providers/web';

import { Route } from '@routes/_public/auth/verify-email';

import { useNavigate } from '@tanstack/react-router';

// Verify email view
export function VerifyEmailView(): ReactElement {
    const { id } = Route.useSearch();

    const navigate = useNavigate();

    const { mutateAsync: verifyEmail } = api.auth.verifyEmail.useMutation();

    useEffect(() => {
        const verify = async () => {
            const { error } = await verifyEmail({ id });

            if (!error) {
                toast.success('Email verified successfully', {
                    description: 'You can now log in to your account',
                });

                await navigate({ to: '/' });
            }
        };

        void verify();
    }, [id, verifyEmail, navigate]);

    return <></>;
}
