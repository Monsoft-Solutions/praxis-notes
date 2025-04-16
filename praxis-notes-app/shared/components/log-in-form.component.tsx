import { ReactElement } from 'react';

import { Link } from '@tanstack/react-router';

import type { UseFormReturn } from 'react-hook-form';

import type { BookmarkedUser, LogInCredentials } from '@auth/schemas';

import { templateRoleHumanReadable } from '@src/template/utils';

import { Button } from '@shared/ui/button.ui';

import { Badge } from '@shared/ui/badge.ui';

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

import { ChevronDown } from 'lucide-react';

import { ShortInfoMessage } from '@shared/components/short-info-message.component';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu.ui';

import { ScrollArea } from '@shared/ui/scroll-area.ui';

// ----------------------------------------------------------------------

// Log-in form component
// Inputs fields: email, password
// Perform client-side validation
// When valid submition, log in user
// Dropdown menu for quick selection of bookmarked users
export function LogInForm({
    form,
    onSubmit,
    bookmarkedUsers,
}: {
    form: UseFormReturn<LogInCredentials>;
    onSubmit: (data: LogInCredentials) => void;
    bookmarkedUsers: BookmarkedUser[] | null;
}): ReactElement {
    const handleSelectUser = ({ id }: { id: string }) => {
        if (!bookmarkedUsers) return;

        const user = bookmarkedUsers.find((user) => user.id === id);
        if (!user) return;

        const { email } = user;

        if (email !== form.watch('email')) form.resetField('password');

        form.setValue('email', email);

        form.setFocus('password');
    };

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

                                        {bookmarkedUsers && (
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="absolute right-2 size-6 px-0 py-0"
                                                    >
                                                        <ChevronDown className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>
                                                        Bookmarked Users
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <ScrollArea className="h-96">
                                                        {bookmarkedUsers.map(
                                                            ({
                                                                id,
                                                                name,
                                                                roles,
                                                            }) => (
                                                                <DropdownMenuItem
                                                                    key={id}
                                                                    onClick={() => {
                                                                        handleSelectUser(
                                                                            {
                                                                                id,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <span className="min-w-44">
                                                                        {name}
                                                                    </span>

                                                                    <ul className="flex items-center gap-1">
                                                                        {roles.map(
                                                                            (
                                                                                role,
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        role
                                                                                    }
                                                                                >
                                                                                    <Badge>
                                                                                        {templateRoleHumanReadable(
                                                                                            role,
                                                                                        )}
                                                                                    </Badge>
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                </DropdownMenuItem>
                                                            ),
                                                        )}
                                                    </ScrollArea>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
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
