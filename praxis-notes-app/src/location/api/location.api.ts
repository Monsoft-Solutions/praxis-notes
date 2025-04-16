import { endpoints } from '@api/providers/server';

// queries
import { getLocations } from './get-locations.query';
import { getClientLocations } from './get-client-locations.query';

// mutations
import { createLocation } from './create-location.mutation';
import { addClientLocation } from './add-client-location.mutation';
import { removeClientLocation } from './remove-client-location.mutation';

// subscriptions

export const location = endpoints({
    // queries
    getLocations,
    getClientLocations,

    // mutations
    createLocation,
    addClientLocation,
    removeClientLocation,

    // subscriptions
});
