import { ReactElement } from 'react';

import { Link } from '@tanstack/react-router';

import type { UseFormReturn } from 'react-hook-form';

import type { LogInCredentials } from '@auth/schemas';

import { Button } from '@ui/button.ui';

import { Input } from '@ui/input.ui';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ui/form.ui';

import { SocialLogIn } from './social-log-in.component';
import { PasswordInput } from '@shared/ui/password-input.ui';

// ----------------------------------------------------------------------

// Log-in form component
// Inputs fields: email, password
// Perform client-side validation
// When valid submition, log in user
// Friendly hand-drawn sketch style with ABA-themed colors
export function LogInForm({
    form,
    onSubmit,
}: {
    form: UseFormReturn<LogInCredentials>;
    onSubmit: (data: LogInCredentials) => void;
}): ReactElement {
    return (
        <div className="relative w-full max-w-md">
            {/* Main form container with hand-drawn style */}
            <div
                className="border-3 relative transform rounded-3xl border-blue-300 bg-white p-6 shadow-lg"
                style={{
                    borderStyle: 'dashed',
                    borderRadius: '25px 30px 20px 35px',
                    background:
                        'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    transform: 'rotate(-0.3deg)',
                }}
            >
                {/* Minimal decorative elements */}
                <div className="absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border-2 border-white bg-blue-400 shadow-md"></div>
                <div className="absolute -right-1 top-6 h-3 w-3 rounded-full bg-orange-400"></div>
                <div className="absolute -left-1 bottom-8 h-4 w-4 rounded-full bg-green-400"></div>

                {/* Form header */}

                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            void form.handleSubmit(onSubmit)(e);
                        }}
                        className="space-y-5"
                    >
                        {/* Email field with gentle styling */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Email Address
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-blue-200 p-1"
                                        style={{
                                            borderRadius: '12px 16px 12px 18px',
                                            transform: 'rotate(0.2deg)',
                                        }}
                                    >
                                        <FormControl>
                                            <Input
                                                placeholder="your-email@example.com"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-300"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Password field with gentle styling */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Password
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-purple-200 p-1"
                                        style={{
                                            borderRadius: '16px 12px 18px 14px',
                                            transform: 'rotate(-0.2deg)',
                                        }}
                                    >
                                        <FormControl>
                                            <PasswordInput
                                                placeholder="Enter your password"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-purple-300"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Submit button with friendly styling */}
                        <div className="pt-3">
                            <div
                                className="hover:scale-102 relative rounded-xl bg-gradient-to-r from-green-400 to-blue-400 p-0.5 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    borderRadius: '20px 24px 18px 26px',
                                    transform: 'rotate(0.2deg)',
                                }}
                            >
                                <Button
                                    type="submit"
                                    className="font-quicksand h-11 w-full border-0 bg-transparent text-base font-semibold text-white shadow-none hover:bg-transparent"
                                    style={{
                                        borderRadius: '19px 23px 17px 25px',
                                        textShadow:
                                            '1px 1px 2px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    Let&apos;s Go! 🚀
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>

                {/* Social login with gentle styling */}
                <div className="mt-5">
                    <div
                        className="relative rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4"
                        style={{
                            borderStyle: 'dashed',
                            borderRadius: '16px 12px 20px 14px',
                            transform: 'rotate(-0.1deg)',
                        }}
                    >
                        <SocialLogIn />
                    </div>
                </div>

                {/* Sign up link with gentle styling */}
                <div className="mt-5 text-center">
                    <div
                        className="inline-block rounded-xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2"
                        style={{
                            borderStyle: 'dotted',
                            borderRadius: '12px 16px 12px 18px',
                            transform: 'rotate(0.1deg)',
                        }}
                    >
                        <span className="font-nunito text-sm text-gray-600">
                            New to Praxis Notes?{' '}
                        </span>
                        <Link to="/auth/sign-up">
                            <Button
                                variant="link"
                                className="font-quicksand px-1 font-semibold text-blue-600 underline decoration-blue-300 decoration-wavy hover:text-blue-700"
                            >
                                Create Account! ✨
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
