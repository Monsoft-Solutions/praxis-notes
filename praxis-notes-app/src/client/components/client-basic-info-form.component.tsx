import { useFormContext } from 'react-hook-form';
import { User, FileText } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Section Header */}
            <div className="mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-400" />
                <h3
                    className="font-quicksand text-xl font-semibold text-gray-800"
                    style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    }}
                >
                    Basic Information
                </h3>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-quicksand font-semibold text-gray-700">
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
                            <FormLabel className="font-quicksand font-semibold text-gray-700">
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

            {/* Gender Field */}
            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-quicksand font-semibold text-gray-700">
                            Gender <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                            value={field.value ?? undefined}
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

            {/* Notes Field */}
            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-quicksand flex items-center gap-2 font-semibold text-gray-700">
                            <FileText className="h-4 w-4 text-orange-400" />
                            Notes
                        </FormLabel>
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
