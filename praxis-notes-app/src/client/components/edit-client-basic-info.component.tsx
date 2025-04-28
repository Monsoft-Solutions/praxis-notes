import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Label } from '@ui/label.ui';
import { Input } from '@ui/input.ui';
import { Switch } from '@ui/switch.ui';
import { Button } from '@ui/button.ui';

import { api } from '@api/providers/web';

type EditClientBasicInfoProps = {
    clientId: string;
    onSaved?: () => void;
};

export const EditClientBasicInfo = ({
    clientId,
    onSaved,
}: EditClientBasicInfoProps) => {
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
            setFormData({
                firstName: client.firstName,
                lastName: client.lastName,
                isActive: client.isActive,
            });
        }
    }, [clientQuery]);

    const handleSave = () => {
        updateClientMutation.mutate({
            clientId,
            ...formData,
        });
    };

    return (
        <div className="space-y-4">
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

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={updateClientMutation.isPending}
                >
                    {updateClientMutation.isPending
                        ? 'Saving...'
                        : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};
