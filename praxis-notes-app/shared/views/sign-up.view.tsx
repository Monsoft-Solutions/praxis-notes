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

// Sign up view
// Render sign up form
export function SignUpView(): ReactElement {
    const navigate = useNavigate();

    const { mutateAsync: signUp } = api.auth.signUp.useMutation();

    const form = useForm<SignUpFormType>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
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
        <div className="flex h-screen bg-gray-50">
            {/* Left side - Form */}
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-white p-8 md:w-1/2">
                <div className="absolute left-0 top-0 -mt-10 w-36">
                    <img
                        src="/images/praxis-notes-logo-main.png"
                        alt="Praxis Notes Logo"
                        className="w-full"
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
                        Join thousands of ABA professionals who are saving time
                        and improving documentation quality.
                    </p>
                </div>
            </div>
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
