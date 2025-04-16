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

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';

import { ShortInfoMessage } from '@shared/components/short-info-message.component';

// ----------------------------------------------------------------------

// Log-in form component
// Inputs fields: email, password
// Perform client-side validation
// When valid submition, log in user
// Dropdown menu for quick selection of bookmarked users
export function LogInForm({
    form,
    onSubmit,
}: {
    form: UseFormReturn<LogInCredentials>;
    onSubmit: (data: LogInCredentials) => void;
}): ReactElement {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Log In</CardTitle>
                <CardDescription>Welcom back !</CardDescription>
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
                    Don&apos;t have an account ?{' '}
                    <Link to="/auth/sign-up">
                        <Button variant="link" className="h-0 px-0 italic">
                            Sign Up
                        </Button>
                    </Link>
                </ShortInfoMessage>
            </CardFooter>
        </Card>
    );
}
