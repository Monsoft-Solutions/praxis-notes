import { ReactElement } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type LogInCredentials, logInCredentialsSchema } from '@auth/schemas';

import { Route } from '@routes/_public/auth/log-in';

import { LogInForm } from '@auth/components';

// Log in view
// Render log in form
export function LogInView(): ReactElement {
    const {
        auth: { logIn },
    } = Route.useRouteContext();

    const { bookmarkedUsers } = Route.useLoaderData();

    const form = useForm<LogInCredentials>({
        resolver: zodResolver(logInCredentialsSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return (
        <div className="grid h-screen items-center justify-center">
            <LogInForm
                form={form}
                onSubmit={(credentials) => {
                    void logIn(credentials);
                }}
                bookmarkedUsers={bookmarkedUsers}
            />
        </div>
    );
}
