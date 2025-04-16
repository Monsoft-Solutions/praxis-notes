import React from 'react';
import { useFormContext } from 'react-hook-form';

import { api } from '@api/providers/web';

import {
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

type LocationSelectorProps = {
    name: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
};

// Define the expected shape of a location object from the API
type LocationData = {
    id: string;
    name: string;
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    name,
    label = 'Location',
    placeholder = 'Select a location',
    disabled = false,
}) => {
    // Get form context, including control
    const { control } = useFormContext();

    // Fetch locations using the API hook
    const locationsQuery = api.location.getLocations.useQuery(undefined, {
        // Ensure data isn't considered stale immediately, adjust as needed
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Safely access and transform locations data
    const locationOptions = React.useMemo(() => {
        // Check for successful query and valid data structure
        if (
            !locationsQuery.isSuccess ||
            locationsQuery.data.error ||
            !Array.isArray(locationsQuery.data.data)
        ) {
            return [];
        }
        // Map the valid data to the options format
        return locationsQuery.data.data.map((location: LocationData) => ({
            value: location.id,
            label: location.name,
        }));
    }, [locationsQuery.data, locationsQuery.isSuccess]);

    const isLoading = locationsQuery.isPending;

    return (
        <FormField
            control={control} // Pass control from useFormContext
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Select
                        onValueChange={field.onChange}
                        value={field.value as string} // Use field.value provided by FormField
                        disabled={disabled || isLoading}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value="loading" disabled>
                                    Loading...
                                </SelectItem>
                            ) : locationOptions.length > 0 ? (
                                locationOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-options" disabled>
                                    No locations available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage /> {/* Display validation errors */}
                </FormItem>
            )}
        />
    );
};
