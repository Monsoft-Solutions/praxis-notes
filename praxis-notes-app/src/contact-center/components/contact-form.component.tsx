import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';

import { Button } from '@ui/button.ui';
import { Textarea } from '@ui/textarea.ui';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ui/form.ui';
import { api } from '@api/providers/web'; // Assuming API provider path
import { toast } from 'sonner';

// Validation schema
const contactSchema = z.object({
    message: z.string().min(1, 'Message is required'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// Props for the component, including any necessary handlers from the parent
type ContactFormProps = {
    onSuccess?: () => void; // Optional callback after successful submission
    className?: string;
};

export function ContactForm({ onSuccess, className }: ContactFormProps) {
    // Initialize form
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            message: '',
        },
    });

    // Check if the form is currently submitting
    const isSubmitting = form.formState.isSubmitting;

    // Mock API mutation hook (replace with actual implementation)
    const { mutateAsync: submitSupportMessage } =
        api.contactCenter.submitSupportMessage.useMutation();

    // Handle form submission
    const onSubmit = async (data: ContactFormValues) => {
        try {
            await submitSupportMessage(data);
            toast.success('Thank you for contacting us!', {
                description: 'We will get back to you as soon as possible.',
            });
            form.reset(); // Reset form fields
            if (onSuccess) {
                onSuccess(); // Call the callback if provided
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    };

    // Stop propagation for dropdown context
    const stopPropagation = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    // Prevent default form submission which causes page reload
                    e.preventDefault();
                    // Stop propagation to prevent dropdown from closing
                    stopPropagation(e);
                    // Handle form submission via react-hook-form
                    void form.handleSubmit(onSubmit)(e);
                }}
                className={`space-y-2 ${className}`}
                onClick={stopPropagation} // Prevent clicks inside form from closing dropdown
            >
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Message *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Message *"
                                    className="h-20 resize-none text-xs"
                                    {...field}
                                    onKeyDown={stopPropagation}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={isSubmitting}
                    // No need for stopPropagation on button if form onSubmit handles it
                >
                    <Send className="mr-2 size-3.5" />
                    {isSubmitting ? 'Sending...' : 'Send'}
                </Button>
            </form>
        </Form>
    );
}
