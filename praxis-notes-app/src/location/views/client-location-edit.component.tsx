import React, { useState } from 'react';

import { Dialog } from '@shared/ui/dialog.ui';
import { Card } from '@shared/ui/card.ui';
import { ClientLocationList } from '../components/client-location-list.component';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@shared/ui/select.ui';
import { Button } from '@shared/ui/button.ui';
import { api } from '@api/providers/web';

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
    const utils = api.useUtils(); // Get TRPC utils

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
            setIsAddDialogOpen(false);
            setSelectedLocationId(null);
            // Invalidate the getClientLocations query to refresh the list
            void utils.location.getClientLocations.invalidate({ clientId });
        },
        onError: (error) => {
            console.error(
                'Failed to add location:',
                error instanceof Error ? error.message : 'Unknown error',
            );
        },
    });

    const availableLocations = React.useMemo(() => {
        // Check if queries succeeded before accessing data
        const locations =
            locationsQuery && !locationsQuery.error
                ? locationsQuery.data
                : undefined;
        const clientLocations =
            clientLocationsQuery && !clientLocationsQuery.error
                ? clientLocationsQuery.data
                : undefined;

        // Ensure data arrays are valid before calculating
        if (!Array.isArray(locations) || !Array.isArray(clientLocations)) {
            return [];
        }

        // Types should be narrowed correctly now
        const assignedLocationIds = new Set(
            clientLocations.map((location) => location.id),
        );

        // Types should be narrowed correctly now
        return locations
            .filter((location) => !assignedLocationIds.has(location.id))
            .map((location) => ({
                value: location.id,
                label: location.name,
            }));
        // Depend on the query result objects directly
    }, [locationsQuery, clientLocationsQuery]);

    const handleAddLocation = () => {
        if (selectedLocationId && clientId) {
            addLocationMutation.mutate({
                clientId,
                locationId: selectedLocationId,
            });
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
    }

    return (
        <div className="space-y-6">
            <ClientLocationList
                clientId={clientId}
                onAddLocation={() => {
                    setIsAddDialogOpen(true);
                }}
            />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <Card>
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="location-select"
                                className="block text-sm font-medium"
                            >
                                Select Location
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
                                        availableLocations.map((location) => (
                                            <SelectItem
                                                key={location.value}
                                                value={location.value}
                                            >
                                                {location.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-options" disabled>
                                            No available locations
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsAddDialogOpen(false);
                                    setSelectedLocationId(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleAddLocation}
                                disabled={
                                    !selectedLocationId ||
                                    addLocationMutation.isPending
                                }
                            >
                                {addLocationMutation.isPending
                                    ? 'Adding...'
                                    : 'Add Location'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Dialog>
        </div>
    );
};
