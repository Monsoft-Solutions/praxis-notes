import { z } from 'zod';

import { ReactElement } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';

import {
    signUpFormSchema,
    type SignUpForm as SignUpFormType,
} from '@auth/schemas';

import { SignUpForm } from '@shared/components/sign-up-form.component';

import { userLangEnumSchema } from '@auth/enum/user-lang.enum';

import { authClient } from '@auth/providers/web/auth-client.provider';

const signUpFormSchemaValidated: typeof signUpFormSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    language: userLangEnumSchema,
});

// Sign up view
// Render sign up form with beautiful ABA-themed design
export function SignUpView(): ReactElement {
    const navigate = useNavigate();

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
        const { error: errorSigningUp } = await authClient.signUp.email({
            name: data.firstName,
            email: data.email,
            password: data.password,
            lastName: data.lastName,
        });

        if (errorSigningUp) {
            toast.error('Error signing up');
            return;
        }

        toast.success('Signed up successfully');

        await navigate({ to: '/auth/waiting-email-verification' });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
            {/* Hand-drawn background elements */}
            <div className="pointer-events-none absolute inset-0">
                {/* Scattered puzzle pieces background */}
                <div className="absolute left-16 top-16 h-6 w-6 rotate-45 transform rounded-sm bg-green-300 opacity-25"></div>
                <div className="absolute right-32 top-40 h-8 w-8 -rotate-12 transform rounded-sm bg-blue-300 opacity-20"></div>
                <div className="absolute bottom-48 left-24 h-7 w-7 rotate-6 transform rounded-sm bg-purple-300 opacity-30"></div>
                <div className="absolute bottom-32 right-16 h-9 w-9 -rotate-45 transform rounded-sm bg-orange-300 opacity-25"></div>
                <div className="absolute left-1/4 top-1/3 h-5 w-5 rotate-12 transform rounded-sm bg-yellow-300 opacity-35"></div>

                {/* Hand-drawn circles and shapes */}
                <div
                    className="border-3 absolute left-10 top-1/4 h-14 w-14 -rotate-6 transform rounded-full border-green-300 opacity-25"
                    style={{
                        borderStyle: 'dashed',
                        borderRadius: '65% 35% 60% 40%',
                    }}
                ></div>
                <div
                    className="absolute bottom-1/4 right-12 h-12 w-12 rotate-12 transform rounded-full border-4 border-purple-300 opacity-20"
                    style={{
                        borderStyle: 'dotted',
                        borderRadius: '55% 45% 70% 30%',
                    }}
                ></div>
                <div
                    className="absolute right-1/4 top-2/3 h-10 w-10 -rotate-3 transform rounded-full border-2 border-blue-300 opacity-30"
                    style={{
                        borderStyle: 'dashed',
                        borderRadius: '40% 60% 50% 50%',
                    }}
                ></div>
            </div>

            {/* Main content container */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
                {/* Logo positioned absolutely */}
                <div className="absolute left-6 top-6 w-36 transform transition-transform duration-300 hover:scale-105">
                    <img
                        src="/images/praxis-notes-logo-main.png"
                        alt="Praxis Notes Logo"
                        className="w-full drop-shadow-lg"
                    />
                </div>

                {/* Main content wrapper */}
                <div className="w-full max-w-4xl">
                    {/* Welcome header */}
                    <div className="mb-8 text-center">
                        <h1
                            className="font-quicksand mb-4 rotate-1 transform text-4xl font-bold text-gray-800"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            Join Our Community!
                        </h1>
                        <div
                            className="relative mx-auto max-w-2xl -rotate-1 transform rounded-2xl border-4 border-green-200 bg-white p-6 shadow-xl"
                            style={{
                                borderStyle: 'dashed',
                                borderRadius: '30px 20px 25px 35px',
                            }}
                        >
                            <div className="absolute -left-2 -top-2 h-5 w-5 rounded-full border-2 border-white bg-blue-400"></div>
                            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 border-white bg-orange-400"></div>
                            <div className="absolute right-4 top-1 h-3 w-3 rounded-full bg-purple-400"></div>

                            <p className="font-nunito mb-2 text-lg font-semibold text-gray-700">
                                Start your journey with AI-powered ABA
                                documentation
                            </p>
                            <p className="font-nunito text-base text-gray-600">
                                Join thousands of RBTs and BCBAs who are saving
                                hours each week!
                            </p>
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid items-start gap-8 md:grid-cols-2">
                        {/* Left side - Sign up form */}
                        <div className="order-2 md:order-1">
                            <div
                                className="relative rotate-1 transform rounded-3xl border-4 border-blue-200 bg-white p-8 shadow-2xl"
                                style={{
                                    borderStyle: 'solid',
                                    borderRadius: '25px 35px 20px 30px',
                                    background:
                                        'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                                }}
                            >
                                {/* Decorative elements */}
                                <div className="border-3 absolute -top-3 right-8 h-7 w-7 rounded-full border-white bg-green-400"></div>
                                <div className="absolute -right-2 top-6 h-4 w-4 rounded-full border-2 border-white bg-orange-400"></div>
                                <div className="absolute -left-2 bottom-6 h-5 w-5 rounded-full border-2 border-white bg-purple-400"></div>
                                <div className="absolute -bottom-3 right-12 h-6 w-6 rounded-full border-2 border-white bg-yellow-400"></div>

                                {/* Form header */}
                                <div className="mb-6 text-center">
                                    <h2 className="font-quicksand -rotate-1 transform text-2xl font-bold text-gray-800">
                                        Create Your Account
                                    </h2>
                                    <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
                                </div>

                                <SignUpForm
                                    form={form}
                                    onSubmit={(data) => void handleSubmit(data)}
                                />

                                {/* Trust indicators */}
                                <div className="mt-6 text-center">
                                    <div
                                        className="rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4"
                                        style={{
                                            borderStyle: 'dashed',
                                            borderRadius: '15px 25px 15px 20px',
                                        }}
                                    >
                                        <p className="font-nunito text-xs text-gray-600">
                                            <span className="font-semibold text-green-600">
                                                HIPAA Compliant
                                            </span>{' '}
                                            • Secure • Trusted by professionals
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Features and benefits */}
                        <div className="order-1 md:order-2">
                            <div
                                className="relative -rotate-1 transform rounded-3xl border-4 border-purple-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8"
                                style={{
                                    borderStyle: 'dashed',
                                    borderRadius: '35px 20px 30px 25px',
                                }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-2 left-8 h-6 w-6 rounded-full border-2 border-white bg-yellow-400"></div>
                                <div className="absolute -right-2 top-4 h-4 w-4 rounded-full bg-green-400"></div>
                                <div className="absolute -left-2 bottom-8 h-5 w-5 rounded-full border-2 border-white bg-orange-400"></div>

                                <h3 className="font-quicksand mb-6 rotate-1 transform text-2xl font-bold text-gray-800">
                                    Why ABA Professionals Love Us
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        {
                                            title: 'Save Hours Weekly',
                                            description:
                                                'Generate detailed, insurance-ready session notes in seconds',
                                            color: 'blue',
                                        },
                                        {
                                            title: 'HIPAA Compliant',
                                            description:
                                                'Your client data is secure and protected',
                                            color: 'green',
                                        },
                                        {
                                            title: 'Smart AI Technology',
                                            description:
                                                'AI understands ABA terminology and best practices',
                                            color: 'purple',
                                        },
                                        {
                                            title: 'Track Progress',
                                            description:
                                                'Monitor client goals and celebrate achievements',
                                            color: 'orange',
                                        },
                                    ].map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`border-3 rounded-2xl bg-white p-4 border-${feature.color}-200 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} shadow-lg`}
                                            style={{
                                                borderStyle: 'solid',
                                                borderRadius:
                                                    '20px 15px 25px 18px',
                                            }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div
                                                    className={`h-8 w-8 bg-${feature.color}-400 mt-1 flex items-center justify-center rounded-full border-2 border-white`}
                                                >
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-quicksand font-semibold text-gray-800">
                                                        {feature.title}
                                                    </h4>
                                                    <p className="font-nunito mt-1 text-sm text-gray-600">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Social proof */}
                                <div className="mt-6">
                                    <div
                                        className="border-3 rotate-1 transform rounded-2xl border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 p-4"
                                        style={{
                                            borderStyle: 'dotted',
                                            borderRadius: '25px 15px 20px 30px',
                                        }}
                                    >
                                        <p className="font-nunito text-center text-sm text-gray-700">
                                            <span className="font-quicksand font-bold text-orange-600">
                                                1000+
                                            </span>{' '}
                                            RBTs and BCBAs already saving time
                                            with our platform
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with hand-drawn style */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex justify-center">
                    <div
                        className="rotate-1 transform rounded-full border-2 border-gray-200 bg-white px-6 py-2 shadow-lg"
                        style={{
                            borderRadius: '30px 20px 25px 35px',
                        }}
                    >
                        <div className="flex items-center space-x-4 text-sm">
                            <a
                                href="https://praxisnote.com"
                                className="font-nunito font-medium text-gray-600 transition-colors hover:text-blue-600"
                            >
                                © Praxis Notes
                            </a>
                            <span className="text-gray-400">|</span>
                            <a
                                href="https://praxisnotes.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-nunito font-medium text-gray-600 transition-colors hover:text-blue-600"
                            >
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating elements for extra charm */}
            <div
                className="absolute right-24 top-24 animate-bounce"
                style={{ animationDelay: '0s', animationDuration: '4s' }}
            >
                <div className="text-2xl">📝</div>
            </div>
            <div
                className="absolute bottom-40 left-32 animate-bounce"
                style={{ animationDelay: '1.5s', animationDuration: '3s' }}
            >
                <div className="text-2xl">⭐</div>
            </div>
            <div
                className="absolute right-8 top-1/2 animate-bounce"
                style={{ animationDelay: '0.5s', animationDuration: '5s' }}
            >
                <div className="text-xl">🎯</div>
            </div>
            <div
                className="absolute left-4 top-1/3 animate-bounce"
                style={{ animationDelay: '2s', animationDuration: '4s' }}
            >
                <div className="text-xl">🌈</div>
            </div>
        </div>
    );
}
