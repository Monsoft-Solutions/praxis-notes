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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@shared/ui/card.ui';

import { ShortInfoMessage } from '@shared/components/short-info-message.component';

// ----------------------------------------------------------------------

// Sign up form component
// Inputs fields: name, email, password
export function SignUpForm({
    form,
    onSubmit,
}: {
    form: UseFormReturn<SignUpForm>;
    onSubmit: (data: SignUpForm) => void;
}): ReactElement {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                    Create an account to get started !
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            void form.handleSubmit(onSubmit)(e);
                        }}
                        className="grid gap-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>

                                    <div className="relative flex items-center">
                                        <FormControl>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>

                                    <div className="relative flex items-center">
                                        <FormControl>
                                            <Input
                                                placeholder="email@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="********"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="">
                            Submit
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="flex items-center gap-2">
                <ShortInfoMessage>
                    Already have an account ?{' '}
                    <Link to="/auth/log-in">
                        <Button variant="link" className="h-0 px-0 italic">
                            Log In
                        </Button>
                    </Link>
                </ShortInfoMessage>
            </CardFooter>
        </Card>
    );
}
