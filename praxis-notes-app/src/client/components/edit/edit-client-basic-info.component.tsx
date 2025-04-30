import { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import { Input } from '@ui/input.ui';
import { Switch } from '@ui/switch.ui';
import { Button } from '@ui/button.ui';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@shared/ui/form.ui';

import { api } from '@api/providers/web';

type ClientFormValues = {
    firstName: string;
    lastName: string;
    isActive: boolean;
};

type EditClientBasicInfoProps = {
    clientId: string;
    onSaved?: () => void;
};

export const EditClientBasicInfo = ({
    clientId,
    onSaved,
}: EditClientBasicInfoProps) => {
    const form = useForm<ClientFormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            isActive: true,
        },
    });

    const { data: clientQuery } = api.client.getClient.useQuery({
        clientId,
    });

    const updateClientMutation = api.client.updateClient.useMutation({
        onSuccess: () => {
            toast.success('Client information updated');
            if (onSaved) onSaved();
        },
        onError: () => {
            toast.error('Failed to update client information');
        },
    });

    useEffect(() => {
        if (!clientQuery?.error && clientQuery?.data) {
            const client = clientQuery.data;
            form.reset({
                firstName: client.firstName,
                lastName: client.lastName,
                isActive: client.isActive,
            });
        }
    }, [clientQuery, form]);

    const onSubmit = (data: ClientFormValues) => {
        updateClientMutation.mutate({
            clientId,
            ...data,
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void form.handleSubmit(onSubmit)(e);
                }}
                className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input {...field} required />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input {...field} required />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="isActive"
                                />
                            </FormControl>
                            <FormLabel className="mt-0">
                                Active Client
                            </FormLabel>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={updateClientMutation.isPending}
                    >
                        {updateClientMutation.isPending
                            ? 'Saving...'
                            : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
