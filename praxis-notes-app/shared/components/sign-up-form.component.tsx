import { ReactElement } from 'react';

import { Link } from '@tanstack/react-router';

import type { UseFormReturn } from 'react-hook-form';

import type { SignUpForm } from '@auth/schemas';

import { Button } from '@shared/ui/button.ui';

import { Input } from '@shared/ui/input.ui';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@shared/ui/form.ui';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@shared/ui/select.ui';

import { ShortInfoMessage } from '@shared/components/short-info-message.component';

import { SocialLogIn } from './social-log-in.component';
import { PasswordInput } from '@shared/ui/password-input.ui';

// ----------------------------------------------------------------------

// Sign up form component
// Inputs fields: firstName, lastName, email, password, language
// Friendly hand-drawn sketch style with ABA-themed colors
export function SignUpForm({
    form,
    onSubmit,
}: {
    form: UseFormReturn<SignUpForm>;
    onSubmit: (data: SignUpForm) => void;
}): ReactElement {
    return (
        <div className="relative w-full max-w-md">
            {/* Main form container with hand-drawn style */}
            <div
                className="border-3 relative transform rounded-3xl border-purple-300 bg-white p-6 shadow-lg"
                style={{
                    borderStyle: 'dashed',
                    borderRadius: '25px 30px 20px 35px',
                    background:
                        'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
                    transform: 'rotate(0.3deg)',
                }}
            >
                {/* Minimal decorative elements */}
                <div className="absolute -top-2 left-1/2 h-6 w-6 -translate-x-1/2 transform rounded-full border-2 border-white bg-purple-400 shadow-md"></div>
                <div className="absolute -right-1 top-6 h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="absolute -left-1 bottom-8 h-4 w-4 rounded-full bg-blue-400"></div>

                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            void form.handleSubmit(onSubmit)(e);
                        }}
                        className="space-y-4"
                    >
                        {/* First Name field */}
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        First Name
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
                                                placeholder="John"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-300"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Last Name field */}
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Last Name
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-green-200 p-1"
                                        style={{
                                            borderRadius: '16px 12px 18px 14px',
                                            transform: 'rotate(-0.2deg)',
                                        }}
                                    >
                                        <FormControl>
                                            <Input
                                                placeholder="Doe"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-green-300"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Email field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Email Address
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-blue-300 p-1"
                                        style={{
                                            borderRadius: '14px 18px 14px 20px',
                                            transform: 'rotate(0.1deg)',
                                        }}
                                    >
                                        <FormControl>
                                            <Input
                                                placeholder="your-email@example.com"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-400"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Password field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Password
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-green-300 p-1"
                                        style={{
                                            borderRadius: '18px 14px 20px 16px',
                                            transform: 'rotate(-0.1deg)',
                                        }}
                                    >
                                        <FormControl>
                                            <PasswordInput
                                                placeholder="Create a strong password"
                                                className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-green-400"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Language field */}
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-nunito font-medium text-gray-700">
                                        Language
                                    </FormLabel>
                                    <div
                                        className="relative rounded-xl border-2 border-blue-200 p-1"
                                        style={{
                                            borderRadius: '15px 19px 13px 21px',
                                            transform: 'rotate(0.2deg)',
                                        }}
                                    >
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="font-nunito h-11 rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-300">
                                                    <SelectValue placeholder="Choose your language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="en">
                                                    English
                                                </SelectItem>
                                                <SelectItem value="es">
                                                    Spanish
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FormMessage className="font-nunito text-sm" />
                                </FormItem>
                            )}
                        />

                        {/* Submit button with minimal gradient */}
                        <div className="pt-3">
                            <div
                                className="hover:scale-102 relative rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 p-0.5 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    borderRadius: '20px 24px 18px 26px',
                                    transform: 'rotate(-0.2deg)',
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
                                    Create Account! ✨
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
                            transform: 'rotate(0.1deg)',
                        }}
                    >
                        <SocialLogIn />
                    </div>
                </div>

                {/* Log in link with gentle styling */}
                <div className="mt-5 text-center">
                    <div
                        className="inline-block rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2"
                        style={{
                            borderStyle: 'dotted',
                            borderRadius: '12px 16px 12px 18px',
                            transform: 'rotate(-0.1deg)',
                        }}
                    >
                        <ShortInfoMessage>
                            <span className="font-nunito text-sm text-gray-600">
                                Already have an account?{' '}
                            </span>
                            <Link to="/auth/log-in">
                                <Button
                                    variant="link"
                                    className="font-quicksand px-1 font-semibold text-blue-600 underline decoration-blue-300 decoration-wavy hover:text-blue-700"
                                >
                                    Log In! 🚀
                                </Button>
                            </Link>
                        </ShortInfoMessage>
                    </div>
                </div>
            </div>
        </div>
    );
}
