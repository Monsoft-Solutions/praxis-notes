import { ReactElement, useState } from 'react';
import { Route } from '@routes/_private/_app/route';
import { langMap } from '@shared/utils/language-code-to-name.util';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { toast } from 'sonner';
import { Spinner } from '@shared/ui/spinner.ui';
import { updateUserSchema } from '../schemas';

import { authClient } from '@auth/providers/web/auth-client.provider';
import { UserLang } from '@auth/enum/user-lang.enum';

export function UserInformation(): ReactElement {
    const { loggedInUser } = Route.useRouteContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState({
        name: loggedInUser.name,
        lastName: loggedInUser.lastName ?? '',
        language: loggedInUser.language as 'en' | 'es',
    });

    // Initialize form with current user data
    const form = useForm({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            firstName: userData.name,
            lastName: userData.lastName,
            language: userData.language,
        },
    });

    // Handle form submission
    const onSubmit = async (data: {
        firstName: string;
        lastName: string;
        language: UserLang;
    }) => {
        try {
            setIsLoading(true);
            const result = await authClient.updateUser({
                name: data.firstName,
                lastName: data.lastName,
                language: data.language,
            });

            if (result.error) {
                toast.error('Failed to update user information');
            } else {
                toast.success('User information updated successfully');

                // Update the local state with new user data
                setUserData({
                    name: data.firstName,
                    lastName: data.lastName,
                    language: data.language,
                });

                setIsEditing(false);
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Display view mode (non-editable)
    if (!isEditing) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                        Personal Information
                    </h3>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        Edit Information
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm">Name</p>
                        <p className="font-medium">
                            {userData.name} {userData.lastName}
                        </p>
                    </div>

                    <div>
                        <p className="text-muted-foreground text-sm">Email</p>
                        <p className="font-medium">{loggedInUser.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Language
                        </p>
                        <p className="font-medium">
                            {langMap(userData.language)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Member Since
                        </p>
                        <p className="font-medium">
                            {new Date(
                                loggedInUser.createdAt,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Display edit mode
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                    Edit Personal Information
                </h3>
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsEditing(false);
                    }}
                >
                    Cancel
                </Button>
            </div>

            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        void form.handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium">
                                        First Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium">
                                        Last Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium">
                                        Language
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Language" />
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-end">
                            <p className="text-muted-foreground text-sm">
                                Email cannot be changed
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
