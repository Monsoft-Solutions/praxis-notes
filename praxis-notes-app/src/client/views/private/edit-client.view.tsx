import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@ui/button.ui';
import {
    CardContent,
    CardFooter,
    Card,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';
import { Label } from '@ui/label.ui';
import { Input } from '@ui/input.ui';
import { Switch } from '@ui/switch.ui';

import { api } from '@api/providers/web';

import { Route } from '@routes/_private/_app/clients/$clientId/edit';

export const EditClientView = () => {
    const { clientId } = Route.useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        isActive: true,
    });

    const { data: clientQuery } = api.client.getClient.useQuery({
        clientId,
    });

    const updateClientMutation = api.client.updateClient.useMutation({
        onSuccess: () => {
            toast.success('Client updated successfully');
            void navigate({
                to: '/clients',
            });
        },
        onError: () => {
            toast.error('Failed to update client');
        },
    });

    useEffect(() => {
        if (!clientQuery?.error && clientQuery?.data) {
            const client = clientQuery.data;
            setFormData({
                firstName: client.firstName,
                lastName: client.lastName,
                isActive: client.isActive,
            });
        }
    }, [clientQuery, clientId]);

    if (!clientQuery || clientQuery.error) {
        return (
            <div className="container mx-auto py-6">Error loading clients</div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateClientMutation.mutate({
            clientId,
            ...formData,
        });
    };

    const handleCancel = () => {
        void navigate({
            to: '/clients/$clientId/sessions',
            params: { clientId },
        });
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 text-2xl font-bold">Edit Client</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value,
                                    });
                                }}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    });
                                }}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => {
                                    setFormData({
                                        ...formData,
                                        isActive: checked,
                                    });
                                }}
                            />
                            <Label htmlFor="isActive">Active Client</Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateClientMutation.isPending}
                        >
                            {updateClientMutation.isPending
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
