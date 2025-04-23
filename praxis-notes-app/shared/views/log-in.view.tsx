import { ReactElement } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type LogInCredentials, logInCredentialsSchema } from '@auth/schemas';

import { Route } from '@routes/_public/auth/log-in';

import { LogInForm } from '@shared/components/log-in-form.component';

// Log in view
// Render log in form
export function LogInView(): ReactElement {
    const {
        auth: { logIn },
    } = Route.useRouteContext();

    const { email } = Route.useSearch();

    const form = useForm<LogInCredentials>({
        resolver: zodResolver(logInCredentialsSchema),
        defaultValues: {
            email: email ?? '',
            password: '',
        },
    });

    return (
        <div className="grid h-screen items-center justify-center bg-blue-50">
            <div className="absolute left-0 top-0 -mt-10 w-36">
                <img
                    src="/images/praxis-notes-logo-main.png"
                    alt="Praxis Notes Logo"
                    className="w-full"
                />
            </div>
            <LogInForm
                form={form}
                onSubmit={(credentials) => {
                    void logIn(credentials);
                }}
            />

            <div className="absolute bottom-2 left-2 right-0">
                <div className="flex justify-start">
                    <a
                        href="https://praxisnote.com"
                        className="text-sm text-gray-500"
                    >
                        © Praxis Notes
                    </a>
                    <span className="mx-2 text-gray-500">|</span>
                    <a
                        href="https://praxisnotes.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}
