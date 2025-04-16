import React, { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@shared/ui/dialog.ui';
import { ClientLocationList } from '../components/client-location-list.component';
import { LocationForm } from '../components/location-form.component';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@shared/ui/select.ui';
import { Button } from '@shared/ui/button.ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs.ui';
import { api } from '@api/providers/web';
import { toast } from 'sonner';

type ClientLocationEditProps = {
    clientId: string;
};

export const ClientLocationEdit: React.FC<ClientLocationEditProps> = ({
    clientId,
}) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState('select');
    const utils = api.useUtils();

    const {
        data: locationsQuery,
        isLoading: isLoadingLocations,
        error: locationsError,
    } = api.location.getLocations.useQuery();
    const {
        data: clientLocationsQuery,
        isLoading: isLoadingClientLocations,
        error: clientLocationsError,
    } = api.location.getClientLocations.useQuery({ clientId });

    const addLocationMutation = api.location.addClientLocation.useMutation({
        onSuccess: () => {
            toast.success('Location associated successfully');
            void utils.location.getClientLocations.invalidate({ clientId });
            void utils.location.getLocations.invalidate();
            setIsAddDialogOpen(false);
            setSelectedLocationId(null);
            setActiveTab('select');
        },
        onError: (error) => {
            toast.error('Failed to associate location');
            console.error(
                'Failed to add location:',
                error instanceof Error ? error.message : 'Unknown error',
            );
        },
    });

    const availableLocations = React.useMemo(() => {
        const locations =
            locationsQuery && !locationsQuery.error
                ? locationsQuery.data
                : undefined;
        const clientLocations =
            clientLocationsQuery && !clientLocationsQuery.error
                ? clientLocationsQuery.data
                : undefined;

        if (!Array.isArray(locations) || !Array.isArray(clientLocations)) {
            return [];
        }

        const assignedLocationIds = new Set(
            clientLocations.map((location) => location.id),
        );

        return locations
            .filter((location) => !assignedLocationIds.has(location.id))
            .map((location) => ({
                value: location.id,
                label: location.name,
            }));
    }, [locationsQuery, clientLocationsQuery]);

    const handleAssociateLocation = () => {
        if (selectedLocationId && clientId) {
            addLocationMutation.mutate({
                clientId,
                locationId: selectedLocationId,
            });
        }
    };

    const handleLocationCreated = (newLocationId?: string) => {
        if (newLocationId) {
            addLocationMutation.mutate({
                clientId,
                locationId: newLocationId,
            });
        } else {
            toast.error(
                'Location created, but failed to associate automatically.',
            );
            void utils.location.getClientLocations.invalidate({ clientId });
            void utils.location.getLocations.invalidate();
            setIsAddDialogOpen(false);
            setActiveTab('select');
        }
    };

    if (isLoadingLocations || isLoadingClientLocations) {
        return <div>Loading locations...</div>;
    }

    if (locationsError || clientLocationsError) {
        console.error(
            'Location Data Error:',
            locationsError,
            clientLocationsError,
        );
        return <div>Error loading location data.</div>;
    }

    return (
        <div className="space-y-6">
            <ClientLocationList
                clientId={clientId}
                onAddLocation={() => {
                    setSelectedLocationId(null);
                    setActiveTab('select');
                    setIsAddDialogOpen(true);
                }}
            />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Add Location to Client</DialogTitle>
                    </DialogHeader>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="select">
                                Select Existing
                            </TabsTrigger>
                            <TabsTrigger value="create">Create New</TabsTrigger>
                        </TabsList>
                        <TabsContent value="select" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="location-select"
                                    className="block text-sm font-medium"
                                >
                                    Available Locations
                                </label>
                                <Select
                                    value={selectedLocationId ?? ''}
                                    onValueChange={setSelectedLocationId}
                                >
                                    <SelectTrigger id="location-select">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableLocations.length > 0 ? (
                                            availableLocations.map(
                                                (location) => (
                                                    <SelectItem
                                                        key={location.value}
                                                        value={location.value}
                                                    >
                                                        {location.label}
                                                    </SelectItem>
                                                ),
                                            )
                                        ) : (
                                            <SelectItem
                                                value="no-options"
                                                disabled
                                            >
                                                No available locations
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="default"
                                    onClick={handleAssociateLocation}
                                    disabled={
                                        !selectedLocationId ||
                                        addLocationMutation.isPending
                                    }
                                >
                                    {addLocationMutation.isPending
                                        ? 'Associating...'
                                        : 'Associate Location'}
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="create" className="space-y-4 pt-4">
                            <LocationForm onSuccess={handleLocationCreated} />
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsAddDialogOpen(false);
                                setSelectedLocationId(null);
                                setActiveTab('select');
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
