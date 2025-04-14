import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { Button } from '@ui/button.ui';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui/dialog.ui';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ui/form.ui';

import { Input } from '@ui/input.ui';

import { Textarea } from '@ui/textarea.ui';

import { api } from '@api/providers/web';

import { toast } from 'sonner';

import { apiClientUtils } from '@api/providers/web';

// Validation schema based on the database schema
const formSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type InterventionFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function InterventionForm({
    open,
    onOpenChange,
    onSuccess,
}: InterventionFormProps) {
    const { mutateAsync: createIntervention } =
        api.intervention.createIntervention.useMutation();

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const onSubmit = async (data: FormValues) => {
        console.log('-->   ~ onSubmit ~ data:', data);

        const { error } = await createIntervention(data);

        if (error) {
            console.error('-->   ~ onSubmit ~ error:', error);
        }

        // Close modal and refresh data
        onOpenChange(false);
        form.reset();

        // Callback if provided
        if (onSuccess) {
            onSuccess();
        }

        toast.success('Intervention created successfully');

        void apiClientUtils.intervention.getInterventions.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Intervention</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to create a new intervention.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void form.handleSubmit(onSubmit)(e);
                        }}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter intervention name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
