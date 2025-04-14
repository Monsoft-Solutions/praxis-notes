import { useFormContext } from 'react-hook-form';

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@ui/form.ui';

import { Input } from '@ui/input.ui';

import { Textarea } from '@ui/textarea.ui';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';

import { ClientFormBasicInfo } from '../schemas';

export function ClientBasicInfoForm() {
    const form = useFormContext<ClientFormBasicInfo>();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                First Name{' '}
                                <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter first name"
                                    {...field}
                                />
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
                            <FormLabel>
                                Last Name{' '}
                                <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter last name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Gender <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter additional notes (optional)"
                                {...field}
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
