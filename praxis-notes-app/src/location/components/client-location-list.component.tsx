import React from 'react';

import { api } from '@api/providers/web';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card.ui';
import { Button } from '@shared/ui/button.ui';
import { Badge } from '@shared/ui/badge.ui';

type ClientLocationListProps = {
    clientId: string;
    onAddLocation?: () => void;
};

export const ClientLocationList: React.FC<ClientLocationListProps> = ({
    clientId: propClientId,
    onAddLocation,
}) => {
    const clientId = propClientId;

    const { data: clientLocationsQuery, refetch: refetchClientLocations } =
        api.location.getClientLocations.useQuery(
            { clientId: clientId },
            { enabled: !!clientId },
        );

    if (!clientLocationsQuery) return null;

    const { error: clientLocationsError } = clientLocationsQuery;
    if (clientLocationsError) {
        console.error('Error fetching client locations:', clientLocationsError);
        return <div>Error loading locations.</div>;
    }

    const { data: clientLocations } = clientLocationsQuery;

    const removeLocationMutation =
        api.location.removeClientLocation.useMutation({
            onSuccess: () => {
                void refetchClientLocations();
            },
            onError: (error) => {
                console.error('Error removing location:', error);
            },
        });

    const handleRemoveLocation = (locationId: string) => {
        removeLocationMutation.mutate({
            clientId,
            locationId,
        });
    };

    const locations = clientLocations;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Locations</CardTitle>
                {onAddLocation && (
                    <Button variant="default" size="sm" onClick={onAddLocation}>
                        Add Location
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {locations.length === 0 ? (
                    <div className="text-center text-gray-500">
                        <p>This client has no locations yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {locations.map((location) => (
                            <div
                                key={location.clientLocationId}
                                className="flex items-center justify-between rounded border p-2"
                            >
                                <div>
                                    <div className="font-medium">
                                        {location.name ?? 'Unnamed Location'}
                                    </div>
                                    {location.description && (
                                        <div className="text-sm text-gray-500">
                                            {location.description}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge>Location</Badge>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            handleRemoveLocation(
                                                location.clientLocationId,
                                            );
                                        }}
                                        disabled={
                                            removeLocationMutation.isPending
                                        }
                                    >
                                        {removeLocationMutation.isPending
                                            ? 'Removing...'
                                            : 'Remove'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
