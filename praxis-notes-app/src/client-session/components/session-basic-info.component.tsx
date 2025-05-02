import { useFormContext } from 'react-hook-form';

import { Calendar } from 'lucide-react';

import { format } from 'date-fns';

import { useState, useEffect, useCallback } from 'react';

import { Input } from '@ui/input.ui';

import { Button } from '@ui/button.ui';

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@ui/form.ui';

import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover.ui';

import { Calendar as CalendarComponent } from '@ui/calendar.ui';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card.ui';

import { cn } from '@css/utils';

import MultipleSelector, { Option } from '@shared/ui/select-multiple';

import { ClientSessionForm } from '../schemas';

import { TourStepId } from '@shared/types/tour-step-id.type';
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectItem,
    SelectContent,
} from '@shared/ui/select.ui';

const sessionBasicInfoId: TourStepId = 'session-form-basic-info';

// Location options object
const LOCATION_OPTIONS = [
    { value: 'home', label: 'Home' },
    { value: 'school', label: 'School' },
    { value: 'community', label: 'Community' },
    { value: 'daycare', label: 'Daycare' },
    { value: 'family-home', label: 'Family Home' },
    { value: 'assisted-living', label: 'Assisted Living Facility (ALF)' },
    {
        value: 'community-mental-health',
        label: 'Community Mental Health Center',
    },
    {
        value: 'outpatient-rehab',
        label: 'Comprehensive Outpatient Rehab Facility',
    },
    { value: 'group-home', label: 'Group Home' },
    { value: 'independent-clinic', label: 'Independent Clinic' },
    { value: 'medical-facility', label: 'Medical Facility' },
    { value: 'member-home', label: 'Member Home' },
    { value: 'neighbor-residence', label: 'Neighbor Residence' },
    { value: 'relative-residence', label: 'Relative Residence' },
    { value: 'seasonal-residence', label: 'Seasonal Residence' },
    { value: 'retail-health-clinic', label: 'Walk-in Retail Health Clinic' },
    {
        value: 'ppec-center',
        label: 'Prescribed Pediatric Extended Care (PPEC) Center',
    },
    { value: 'friend-residence', label: 'Friend Residence' },
    { value: 'office', label: 'Office' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'afterschool', label: 'After School' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'other', label: 'Other' },
];

// Environmental changes options
const ENVIRONMENTAL_CHANGES_OPTIONS: Option[] = [
    { value: 'no-changes', label: 'Normal(No changes)' },

    { value: 'change-therapy-area', label: 'Change in Therapy Area' },
    { value: 'client-new-medication', label: 'Client Taking New Medication' },
    { value: 'client-sick', label: 'Client was Sick, Crowded/Noisy' },
    { value: 'distracting-environment', label: 'Distracting Environment' },
    { value: 'lack-of-sleep', label: 'Lack of Sleep' },
    { value: 'visits-during-therapy', label: 'Visits During Therapy' },
    { value: 'change-ambient-odor', label: 'Change in ambient odor' },
    {
        value: 'preparing-to-travel',
        label: 'Client and family are preparing to travel',
    },
    { value: 'no-school', label: 'Client did not attend school' },
    { value: 'doctor-appointment', label: "Client had a doctor's appointment" },
    { value: 'new-pet', label: 'Client has a new pet' },
    { value: 'moved-house', label: 'Client moved to a new house' },
    { value: 'new-medication', label: 'Client is taking new medication' },
    { value: 'parents-divorced', label: 'Clients parents divorced' },
];

// Present participants options
const PRESENT_PARTICIPANT_OPTIONS: Option[] = [
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'parents', label: 'Parents' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'legal-guardian', label: 'Legal Guardian' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'therapist', label: 'Therapist' },
    { value: 'psychologist', label: 'Psychologist' },
    { value: 'social-worker', label: 'Social Worker' },
    { value: 'client', label: 'Client' },
];

export function SessionBasicInfo() {
    const { control, watch, setValue } = useFormContext<ClientSessionForm>();

    const locationValue = watch('location');
    const [customLocation, setCustomLocation] = useState('');

    // Handle custom location changes
    const handleCustomLocationChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setCustomLocation(value);
        setValue('location', value ? `other:${value}` : 'other');
    };

    // Check if location is custom
    const isCustomLocation = useCallback(() => {
        return locationValue.startsWith('other:');
    }, [locationValue]);

    // Get custom location value
    const getCustomLocationValue = useCallback(() => {
        if (isCustomLocation()) {
            return locationValue.substring(6); // Remove 'other:' prefix
        }
        return '';
    }, [locationValue, isCustomLocation]);

    // Initialize custom location when component loads or location changes
    useEffect(() => {
        if (isCustomLocation()) {
            setCustomLocation(getCustomLocationValue());
        }
    }, [isCustomLocation, getCustomLocationValue]);

    // Handle selected environmental changes
    const handleEnvironmentalChangesChange = (
        options: Option[],
        field: { value: string[]; onChange: (value: string[]) => void },
    ) => {
        const values = options.map((option) => option.label);
        field.onChange(values);
    };

    // Handle selected participants
    const handleParticipantsChange = (
        options: Option[],
        field: { value: string[]; onChange: (value: string[]) => void },
    ) => {
        const values = options.map((option) => option.label);
        field.onChange(values);
    };

    return (
        <Card id={sessionBasicInfoId} className="pt-4">
            <CardHeader>
                <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="mt-4 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Session Date */}
                    <FormField
                        control={control}
                        name="sessionDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                )}
                                            >
                                                {format(field.value, 'PPP')}
                                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Location */}
                    <FormField
                        control={control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <div className="space-y-2">
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                if (value === 'other') {
                                                    // If user has already entered a custom value, keep it
                                                    if (customLocation) {
                                                        setValue(
                                                            'location',
                                                            `other:${customLocation}`,
                                                        );
                                                    } else {
                                                        setValue(
                                                            'location',
                                                            'other',
                                                        );
                                                    }
                                                } else {
                                                    // If switching to a standard option, clear custom value
                                                    setCustomLocation('');
                                                    setValue('location', value);
                                                }
                                            }}
                                            defaultValue="home"
                                            value={
                                                isCustomLocation()
                                                    ? 'other'
                                                    : field.value
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LOCATION_OPTIONS.map(
                                                    (location) => (
                                                        <SelectItem
                                                            key={location.value}
                                                            value={
                                                                location.value
                                                            }
                                                        >
                                                            {location.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>

                                    {(field.value === 'other' ||
                                        isCustomLocation()) && (
                                        <FormControl>
                                            <Input
                                                placeholder="Enter custom location"
                                                value={customLocation}
                                                onChange={
                                                    handleCustomLocationChange
                                                }
                                            />
                                        </FormControl>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Start Time */}
                    <FormField
                        control={control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* End Time */}
                    <FormField
                        control={control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Present Participants */}
                    <FormField
                        control={control}
                        name="presentParticipants"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Present Participants</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        placeholder="Select participants"
                                        defaultOptions={
                                            PRESENT_PARTICIPANT_OPTIONS
                                        }
                                        value={field.value.map((value) => {
                                            const option =
                                                PRESENT_PARTICIPANT_OPTIONS.find(
                                                    (opt) =>
                                                        opt.label === value,
                                                );
                                            return (
                                                option ?? {
                                                    value,
                                                    label: value,
                                                }
                                            );
                                        })}
                                        onChange={(options) => {
                                            handleParticipantsChange(
                                                options,
                                                field,
                                            );
                                        }}
                                        creatable
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Environmental Changes */}
                    <FormField
                        control={control}
                        name="environmentalChanges"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Environmental Changes</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        placeholder="Select environmental changes"
                                        defaultOptions={
                                            ENVIRONMENTAL_CHANGES_OPTIONS
                                        }
                                        value={field.value.map((value) => {
                                            const option =
                                                ENVIRONMENTAL_CHANGES_OPTIONS.find(
                                                    (opt) =>
                                                        opt.label === value,
                                                );
                                            return (
                                                option ?? {
                                                    value,
                                                    label: value,
                                                }
                                            );
                                        })}
                                        onChange={(options) => {
                                            handleEnvironmentalChangesChange(
                                                options,
                                                field,
                                            );
                                        }}
                                        creatable
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
