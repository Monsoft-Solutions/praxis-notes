import { useFormContext } from 'react-hook-form';

import { Calendar } from 'lucide-react';

import { format } from 'date-fns';

import { useState } from 'react';

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

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';

import { cn } from '@css/utils';

import { Tag } from '@shared/components/tag.component';

import { ClientSession } from '../schemas';
import { api } from '@api/providers/web';

export function SessionBasicInfo({ clientId }: { clientId: string }) {
    const { control } = useFormContext<ClientSession>();

    const [participantInput, setParticipantInput] = useState('');
    const [environmentalInput, setEnvironmentalInput] = useState('');

    // Fetch client locations
    console.log('clientId', clientId);
    const { data: clientLocationsQuery } =
        api.location.getClientLocations.useQuery(
            { clientId },
            { enabled: !!clientId },
        );
    console.log('clientLocationsQuery', clientLocationsQuery);

    // Fetch all locations to get the global ones
    const { data: allLocationsQuery } = api.location.getLocations.useQuery();

    // Organize locations into client's and global
    const clientLocations =
        clientLocationsQuery && !clientLocationsQuery.error
            ? clientLocationsQuery.data
            : [];
    const allLocations =
        allLocationsQuery && !allLocationsQuery.error
            ? allLocationsQuery.data
            : [];

    console.log('clientLocations', clientLocations);
    console.log('allLocations', allLocations);

    // Global locations (where organizationId is null)
    const globalLocations = allLocations.filter(
        (location) => location.organizationId === null,
    );

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: { value: string[]; onChange: (value: string[]) => void },
        type: 'participants' | 'environmental',
    ) => {
        const input =
            type === 'participants' ? participantInput : environmentalInput;
        const setInput =
            type === 'participants'
                ? setParticipantInput
                : setEnvironmentalInput;

        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();

            if (!field.value.includes(input.trim())) {
                const updatedValue = [...field.value, input.trim()];
                field.onChange(updatedValue);
            }

            setInput('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Session Date */}
                    <FormField
                        control={control}
                        name="sessionDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
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

                    {/* Location - Updated to use Select */}
                    <FormField
                        control={control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a location" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clientLocations.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Client&apos;s
                                                </SelectLabel>
                                                {clientLocations.map(
                                                    (location) => (
                                                        <SelectItem
                                                            key={location.id}
                                                            value={
                                                                location.name
                                                            }
                                                        >
                                                            - {location.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectGroup>
                                        )}
                                        {globalLocations.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Others
                                                </SelectLabel>
                                                {globalLocations.map(
                                                    (location) => (
                                                        <SelectItem
                                                            key={location.id}
                                                            value={
                                                                location.name
                                                            }
                                                        >
                                                            - {location.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectGroup>
                                        )}
                                    </SelectContent>
                                </Select>
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

                {/* Present Participants */}
                <FormField
                    control={control}
                    name="presentParticipants"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Present Participants</FormLabel>
                            <div className="flex flex-col space-y-3">
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            placeholder="Add participant and press Enter"
                                            value={participantInput}
                                            onChange={(e) => {
                                                setParticipantInput(
                                                    e.target.value,
                                                );
                                            }}
                                            onKeyDown={(e) => {
                                                handleKeyDown(
                                                    e,
                                                    field,
                                                    'participants',
                                                );
                                            }}
                                        />
                                    </FormControl>

                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (participantInput.trim()) {
                                                if (
                                                    !field.value.includes(
                                                        participantInput.trim(),
                                                    )
                                                ) {
                                                    field.onChange([
                                                        ...field.value,
                                                        participantInput.trim(),
                                                    ]);
                                                }
                                                setParticipantInput('');
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>

                                {field.value.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {field.value.map(
                                            (
                                                participant: string,
                                                index: number,
                                            ) => (
                                                <Tag
                                                    key={`${participant}-${index}`}
                                                    text={participant}
                                                    onRemove={() => {
                                                        const newParticipants =
                                                            [...field.value];
                                                        newParticipants.splice(
                                                            index,
                                                            1,
                                                        );
                                                        field.onChange(
                                                            newParticipants,
                                                        );
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
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
                            <div className="flex flex-col space-y-3">
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            placeholder="Add environmental change and press Enter"
                                            value={environmentalInput}
                                            onChange={(e) => {
                                                setEnvironmentalInput(
                                                    e.target.value,
                                                );
                                            }}
                                            onKeyDown={(e) => {
                                                handleKeyDown(
                                                    e,
                                                    field,
                                                    'environmental',
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (environmentalInput.trim()) {
                                                if (
                                                    !field.value.includes(
                                                        environmentalInput.trim(),
                                                    )
                                                ) {
                                                    field.onChange([
                                                        ...field.value,
                                                        environmentalInput.trim(),
                                                    ]);
                                                }
                                                setEnvironmentalInput('');
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>

                                {field.value.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {field.value.map(
                                            (change: string, index: number) => (
                                                <Tag
                                                    key={`${change}-${index}`}
                                                    text={change}
                                                    onRemove={() => {
                                                        const newChanges = [
                                                            ...field.value,
                                                        ];
                                                        newChanges.splice(
                                                            index,
                                                            1,
                                                        );
                                                        field.onChange(
                                                            newChanges,
                                                        );
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
