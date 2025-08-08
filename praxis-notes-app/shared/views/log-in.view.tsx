import { ReactElement } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type LogInCredentials, logInCredentialsSchema } from '@auth/schemas';

import { Route } from '@routes/_public/auth/log-in';

import { LogInForm } from '@shared/components/log-in-form.component';

// Log in view
// Render log in form with beautiful ABA-themed design
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100">
            {/* Main scrollable container */}
            <div className="relative flex min-h-screen flex-col">
                {/* Background decorative elements - absolute positioned */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Scattered puzzle pieces background - hide on small mobile */}
                    <div className="absolute left-10 top-10 hidden h-8 w-8 rotate-12 transform rounded-sm bg-blue-300 opacity-20 sm:block"></div>
                    <div className="absolute right-20 top-32 hidden h-6 w-6 -rotate-6 transform rounded-sm bg-orange-300 opacity-25 sm:block"></div>
                    <div className="absolute bottom-40 left-32 hidden h-10 w-10 rotate-45 transform rounded-sm bg-green-300 opacity-15 sm:block"></div>
                    <div className="absolute bottom-20 right-40 hidden h-7 w-7 -rotate-12 transform rounded-sm bg-yellow-300 opacity-30 sm:block"></div>

                    {/* Hand-drawn circles - smaller on mobile */}
                    <div
                        className="absolute right-2 top-1/4 h-8 w-8 rotate-6 transform rounded-full border-2 border-blue-300 opacity-20 sm:right-10 sm:h-16 sm:w-16 sm:border-4"
                        style={{
                            borderStyle: 'dashed',
                            borderRadius: '60% 40% 65% 35%',
                        }}
                    ></div>
                    <div
                        className="sm:border-3 absolute bottom-1/3 left-4 h-6 w-6 -rotate-12 transform rounded-full border-2 border-orange-300 opacity-25 sm:left-16 sm:h-12 sm:w-12"
                        style={{
                            borderStyle: 'dashed',
                            borderRadius: '50% 60% 40% 70%',
                        }}
                    ></div>

                    {/* Floating elements for extra charm - hide on small mobile */}
                    <div
                        className="absolute right-8 top-16 hidden animate-bounce sm:right-32 sm:top-20 sm:block"
                        style={{
                            animationDelay: '0s',
                            animationDuration: '3s',
                        }}
                    >
                        <div className="text-xl sm:text-2xl">🎯</div>
                    </div>
                    <div
                        className="absolute bottom-20 left-4 hidden animate-bounce sm:bottom-32 sm:left-20 sm:block"
                        style={{
                            animationDelay: '1s',
                            animationDuration: '4s',
                        }}
                    >
                        <div className="text-xl sm:text-2xl">🌟</div>
                    </div>
                    <div
                        className="absolute left-2 top-1/3 hidden animate-bounce sm:left-8 sm:block"
                        style={{
                            animationDelay: '2s',
                            animationDuration: '5s',
                        }}
                    >
                        <div className="text-base sm:text-xl">📚</div>
                    </div>
                </div>

                {/* Logo - fixed position at top */}
                <div className="relative z-20 p-2 sm:absolute sm:left-8 sm:top-8">
                    <div
                        className="w-24 transform animate-bounce transition-transform duration-300 hover:scale-105 sm:w-40"
                        style={{
                            animationDelay: '0.5s',
                            animationDuration: '6s',
                        }}
                    >
                        <img
                            src="/images/praxis-notes-logo-main.png"
                            alt="Praxis Notes Logo"
                            className="w-full drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* Main content - flex grow to push footer down */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
                    {/* Content wrapper with max width */}
                    <div className="w-full max-w-5xl">
                        {/* Welcome message */}
                        <div className="mb-6 text-center sm:mb-8">
                            <h1
                                className="font-quicksand mb-2 -rotate-1 transform text-2xl font-bold text-gray-800 sm:mb-4 sm:text-4xl"
                                style={{
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                Welcome Back!
                            </h1>
                            <div
                                className="relative mx-auto max-w-2xl rotate-1 transform rounded-2xl border-2 border-blue-200 bg-white p-3 shadow-xl sm:border-4 sm:p-6"
                                style={{
                                    borderStyle: 'dashed',
                                    borderRadius: '25px 30px 20px 35px',
                                }}
                            >
                                <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-orange-400 sm:-right-2 sm:-top-2 sm:h-6 sm:w-6"></div>
                                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-white bg-green-400 sm:-bottom-2 sm:-left-2 sm:h-4 sm:w-4"></div>

                                <p className="font-nunito mb-1 text-base font-semibold text-gray-700 sm:mb-2 sm:text-lg">
                                    Ready to make a difference?
                                </p>
                                <p className="font-nunito text-sm text-gray-600 sm:text-base">
                                    Log in to continue your amazing work with
                                    learners and families!
                                </p>
                            </div>
                        </div>

                        {/* Main content grid */}
                        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
                            {/* Left side - Login form */}
                            <div className="order-1 md:order-1">
                                <div
                                    className="relative -rotate-1 transform rounded-3xl border-2 border-purple-200 bg-white p-4 shadow-2xl sm:border-4 sm:p-8"
                                    style={{
                                        borderStyle: 'solid',
                                        borderRadius: '30px 25px 35px 20px',
                                        background:
                                            'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                                    }}
                                >
                                    {/* Decorative elements - smaller on mobile */}
                                    <div className="sm:border-3 absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border-2 border-white bg-blue-400 sm:-top-3 sm:h-8 sm:w-8"></div>
                                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400 sm:right-4 sm:top-4 sm:h-3 sm:w-3"></div>
                                    <div className="absolute bottom-2 left-2 h-3 w-3 rounded-full bg-green-400 sm:bottom-4 sm:left-4 sm:h-4 sm:w-4"></div>
                                    <div className="absolute -left-1 top-1/2 h-4 w-4 rounded-full border-2 border-white bg-orange-400 sm:-left-2 sm:h-5 sm:w-5"></div>

                                    {/* Form header */}
                                    <div className="mb-4 text-center sm:mb-6">
                                        <h2 className="font-quicksand rotate-1 transform text-xl font-bold text-gray-800 sm:text-2xl">
                                            Let&apos;s Get Started!
                                        </h2>
                                        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 sm:w-20"></div>
                                    </div>

                                    <LogInForm
                                        form={form}
                                        onSubmit={(credentials) => {
                                            void logIn(credentials);
                                        }}
                                    />

                                    {/* Motivational message */}
                                    <div className="mt-4 text-center sm:mt-6">
                                        <div
                                            className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4"
                                            style={{
                                                borderStyle: 'dashed',
                                                borderRadius:
                                                    '15px 20px 15px 25px',
                                            }}
                                        >
                                            <p className="font-nunito text-xs italic text-gray-700 sm:text-sm">
                                                &quot;Every child deserves a
                                                champion - an adult who will
                                                never give up on them.&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Why Choose Praxis Notes section */}
                            <div className="order-2 md:order-2">
                                <div
                                    className="relative rotate-1 transform rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-lg sm:border-4 sm:p-6"
                                    style={{
                                        borderStyle: 'dashed',
                                        borderRadius: '35px 20px 30px 25px',
                                    }}
                                >
                                    {/* Decorative elements */}
                                    <div className="absolute -top-1 left-6 h-3 w-3 rounded-full border border-white bg-yellow-400 sm:-top-2 sm:left-8 sm:h-4 sm:w-4 sm:border-2"></div>
                                    <div className="absolute -right-1 top-4 h-2 w-2 rounded-full bg-green-400 sm:-right-2 sm:h-3 sm:w-3"></div>
                                    <div className="absolute -left-1 bottom-6 h-3 w-3 rounded-full border border-white bg-orange-400 sm:-left-2 sm:h-4 sm:w-4 sm:border-2"></div>

                                    <h3 className="font-quicksand mb-4 -rotate-1 transform text-center text-lg font-bold text-gray-800 sm:mb-6 sm:text-2xl">
                                        Why Choose Praxis Notes?
                                    </h3>

                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            {
                                                title: 'Save Hours Weekly',
                                                description:
                                                    'Generate detailed, insurance-ready session notes in seconds',
                                                color: 'blue',
                                                emoji: '⏰',
                                            },
                                            {
                                                title: 'HIPAA Compliant',
                                                description:
                                                    'Your client data is secure and protected',
                                                color: 'green',
                                                emoji: '🔒',
                                            },
                                            {
                                                title: 'Smart AI Technology',
                                                description:
                                                    'AI understands ABA terminology and best practices',
                                                color: 'purple',
                                                emoji: '🧠',
                                            },
                                            {
                                                title: 'Track Progress',
                                                description:
                                                    'Monitor client goals and celebrate achievements',
                                                color: 'orange',
                                                emoji: '📈',
                                            },
                                        ].map((feature, index) => (
                                            <div
                                                key={index}
                                                className={`rounded-xl border-2 bg-white p-3 border-${feature.color}-200 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} sm:border-3 shadow-sm sm:p-4`}
                                                style={{
                                                    borderStyle: 'solid',
                                                    borderRadius:
                                                        '20px 15px 25px 18px',
                                                }}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="text-lg sm:text-xl">
                                                        {feature.emoji}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-quicksand text-sm font-semibold text-gray-800 sm:text-base">
                                                            {feature.title}
                                                        </h4>
                                                        <p className="font-nunito mt-1 text-xs text-gray-600 sm:text-sm">
                                                            {
                                                                feature.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Social proof */}
                                    <div className="mt-4 sm:mt-6">
                                        <div
                                            className="rotate-1 transform rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 p-3 sm:p-4"
                                            style={{
                                                borderStyle: 'dotted',
                                                borderRadius:
                                                    '25px 15px 20px 30px',
                                            }}
                                        >
                                            <p className="font-nunito text-center text-sm text-gray-700">
                                                <span className="font-quicksand font-bold text-orange-600">
                                                    1000+
                                                </span>{' '}
                                                RBTs and BCBAs already saving
                                                time with our platform
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fun fact about ABA */}
                        <div className="mt-6 text-center sm:mt-8">
                            <div
                                className="sm:border-3 mx-auto max-w-2xl rotate-1 transform rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 p-3 sm:p-4"
                                style={{
                                    borderStyle: 'dotted',
                                    borderRadius: '20px 15px 25px 18px',
                                }}
                            >
                                <p className="font-nunito text-xs text-gray-700 sm:text-sm">
                                    <span className="font-quicksand font-bold text-orange-600">
                                        Fun Fact:
                                    </span>{' '}
                                    You&apos;re part of a team that helps create
                                    brighter futures, one session at a time!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - relative positioning at bottom */}
                <div className="relative z-10 px-4 py-4">
                    <div className="flex justify-center">
                        <div
                            className="-rotate-1 transform rounded-full border-2 border-gray-200 bg-white px-3 py-1 shadow-lg sm:px-6 sm:py-2"
                            style={{
                                borderRadius: '25px 30px 20px 35px',
                            }}
                        >
                            <div className="flex items-center space-x-2 text-xs sm:space-x-4 sm:text-sm">
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
            </div>
        </div>
    );
}
