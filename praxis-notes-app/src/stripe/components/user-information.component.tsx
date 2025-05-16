import { ReactElement, useState } from 'react';
import { Route } from '@routes/_private/_app/route';
import { langMap } from '@shared/utils/language-code-to-name.util';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/ui/button.ui';
import { Input } from '@shared/ui/input.ui';
import { PasswordInput } from '@shared/ui/password-input.ui';
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
import { changePasswordSchema, updateUserSchema } from '../schemas';

import { authClient } from '@auth/providers/web/auth-client.provider';
import { UserLang } from '@auth/enum/user-lang.enum';
import {
    DialogTrigger,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@shared/ui/dialog.ui';
import { Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card.ui';

export function UserInformation(): ReactElement {
    const { loggedInUser } = Route.useRouteContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
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

    // Initialize password change form
    const passwordForm = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    // Handle form submission
    const onSubmit = async (data: {
        firstName: string;
        lastName: string;
        language: UserLang;
    }) => {
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

        setIsLoading(false);
    };

    // Handle password change submission
    const onPasswordChange = async (data: {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
    }) => {
        try {
            setIsChangingPassword(true);
            const result = await authClient.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                revokeOtherSessions: true, // For enhanced security
            });

            if (result.error) {
                toast.error(
                    result.error.message ?? 'Failed to change password',
                );
            } else {
                toast.success('Password changed successfully');
                passwordForm.reset();
                setIsPasswordDialogOpen(false); // Close dialog after success
            }
        } catch (error) {
            toast.error('An error occurred while changing your password');
            console.error(error);
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Display view mode (non-editable)
    if (!isEditing) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold">
                        User Information
                    </CardTitle>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Information
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground text-sm">
                                Name
                            </p>
                            <p className="font-medium">
                                {userData.name} {userData.lastName}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-sm">
                                Email
                            </p>
                            <p className="font-medium">{loggedInUser.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
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
                </CardContent>
            </Card>
        );
    }

    // Display edit mode
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl font-bold">
                    Edit Personal Information
                </CardTitle>
                <div className="flex space-x-2">
                    <Dialog
                        open={isPasswordDialogOpen}
                        onOpenChange={setIsPasswordDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button variant="secondary">Change Password</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                    Set a new password for your account. Strong
                                    passwords include a mix of uppercase
                                    letters, lowercase letters, numbers, and
                                    special characters.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...passwordForm}>
                                <form
                                    onSubmit={(e) => {
                                        void passwordForm.handleSubmit(
                                            onPasswordChange,
                                        )(e);
                                    }}
                                    className="space-y-4 py-4"
                                >
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmNewPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isChangingPassword}
                                        >
                                            {isChangingPassword ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Changing...
                                                </>
                                            ) : (
                                                'Change Password'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsEditing(false);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
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
            </CardContent>
        </Card>
    );
}
