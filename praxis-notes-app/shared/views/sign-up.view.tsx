import { ReactElement } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    signUpFormSchema,
    type SignUpForm as SignUpFormType,
} from '@auth/schemas';

import { SignUpForm } from '@shared/components/sign-up-form.component';

import { api } from '@api/providers/web';
import { toast } from 'sonner';
import { z } from 'zod';
import { userLangEnumSchema } from '@auth/enum/user-lang.enum';
const signUpFormSchemaValidated: typeof signUpFormSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    language: userLangEnumSchema,
});

// Sign up view
// Render sign up form
export function SignUpView(): ReactElement {
    const navigate = useNavigate();

    const { mutateAsync: signUp } = api.auth.signUp.useMutation();

    const form = useForm<SignUpFormType>({
        resolver: zodResolver(signUpFormSchemaValidated),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            language: 'en',
        },
    });

    const handleSubmit = async (data: SignUpFormType) => {
        const { error } = await signUp(data);

        if (error) {
            toast.error('Error signing up');
        }

        toast.success('Signed up successfully');

        await navigate({ to: '/auth/waiting-email-verification' });
    };

    return (
        <div className="flex h-full min-h-screen flex-col bg-gray-50">
            {/* Main content container */}
            <div className="flex flex-1 flex-col overflow-auto md:flex-row">
                {/* Logo for mobile */}
                <div className="bg-white px-4 py-4 md:hidden">
                    <img
                        src="/images/praxis-notes-logo-main.png"
                        alt="Praxis Notes Logo"
                        className="w-32"
                    />
                </div>

                {/* Left side - Form */}
                <div className="flex w-full flex-col items-center justify-center bg-white p-4 pb-16 md:w-1/2 md:p-8">
                    <div className="mb-6 hidden md:block md:self-start">
                        <img
                            src="/images/praxis-notes-logo-main.png"
                            alt="Praxis Notes Logo"
                            className="w-36"
                        />
                    </div>
                    <SignUpForm
                        form={form}
                        onSubmit={(data) => void handleSubmit(data)}
                    />
                </div>

                {/* Right side - Content */}
                <div className="hidden bg-blue-50 md:flex md:w-1/2 md:flex-col md:justify-center md:p-12">
                    <div className="mx-auto max-w-lg">
                        <h2 className="mb-6 text-3xl font-bold text-gray-800">
                            AI-powered ABA session notes
                        </h2>
                        <p className="mb-4 text-lg text-gray-600">
                            Save hours each week with detailed, insurance-ready
                            documentation in seconds.
                        </p>
                        <ul className="mb-8 space-y-3">
                            <li className="flex items-center text-gray-600">
                                <svg
                                    className="mr-2 h-5 w-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                HIPAA Compliant
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg
                                    className="mr-2 h-5 w-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Create ABA Notes
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg
                                    className="mr-2 h-5 w-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Review & Enhance Notes
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg
                                    className="mr-2 h-5 w-5 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Track Client Progress
                            </li>
                        </ul>
                        <p className="text-sm text-gray-500">
                            Join thousands of ABA professionals who are saving
                            time and improving documentation quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer - fixed at bottom */}
            <div className="mt-auto w-full border-t border-gray-100 bg-white p-4">
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
