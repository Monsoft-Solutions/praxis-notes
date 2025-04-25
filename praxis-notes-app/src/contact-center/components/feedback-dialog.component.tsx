import { useState, useEffect } from 'react';
import { Lightbulb, Send, Plus, Bug } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@ui/dialog.ui';
import { Button } from '@ui/button.ui';
import { Textarea } from '@ui/textarea.ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs.ui';
import { Input } from '@ui/input.ui';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@ui/form.ui';
import { api } from '@api/providers/web';
import { toast } from 'sonner';

import { BUG_SEVERITY, SUGGESTION_TYPES, APP_AREAS } from '../constants';
import {
    suggestionSchema,
    bugSchema,
    type SuggestionFormValues,
    type BugFormValues,
} from '../schemas';
import type { FeedbackType, FeedbackDialogProps } from '../types';

export function FeedbackDialog({
    trigger,
    initialType = 'suggestion',
}: FeedbackDialogProps) {
    const [open, setOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);

    // Initialize suggestion form
    const suggestionForm = useForm<SuggestionFormValues>({
        resolver: zodResolver(suggestionSchema),
        defaultValues: {
            type: '',
            text: '',
        },
    });

    // Initialize bug report form
    const bugForm = useForm<BugFormValues>({
        resolver: zodResolver(bugSchema),
        defaultValues: {
            title: '',
            description: '',
            stepsToReproduce: '',
            area: '',
            severity: '',
            screenshot: null,
        },
    });

    // Watch form states for submission button disabling
    const suggestionIsSubmitting = suggestionForm.formState.isSubmitting;
    const bugIsSubmitting = bugForm.formState.isSubmitting;

    const { mutateAsync: submitFeedback } =
        api.contactCenter.submitFeedback.useMutation();

    const { mutateAsync: submitBugReport } =
        api.contactCenter.submitBugReport.useMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            bugForm.setValue('screenshot', e.target.files[0]);
        }
    };

    const handleAddSuggestionType = () => {
        const currentType = suggestionForm.getValues('type');
        const currentText = suggestionForm.getValues('text');

        if (!currentType) return;

        const selectedType = SUGGESTION_TYPES.find(
            (type) => type.value === currentType,
        );
        if (!selectedType) return;

        const typeText = `[${selectedType.label}] `;

        // Add the suggestion type to the beginning of the text if it's not already there
        if (!currentText.startsWith(typeText)) {
            suggestionForm.setValue('text', typeText + currentText);
        }
    };

    const onSubmitSuggestion = async (data: SuggestionFormValues) => {
        try {
            await submitFeedback(data);
            toast.success('Thank you for your suggestion!');

            // Reset form and close dialog
            suggestionForm.reset();
            setOpen(false);
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            toast.error('Failed to submit suggestion. Please try again.');
        }
    };

    const onSubmitBugReport = async (data: BugFormValues) => {
        try {
            await submitBugReport({
                title: data.title,
                description: data.description,
                stepsToReproduce: data.stepsToReproduce,
                area: data.area,
                severity: data.severity,
                // Handle screenshot upload separately if needed
                screenshotPath: data.screenshot
                    ? data.screenshot.name
                    : undefined,
            });

            toast.success('Thank you for reporting this bug!');

            // Reset form and close dialog
            bugForm.reset();
            setOpen(false);
        } catch (error) {
            console.error('Error submitting bug report:', error);
            toast.error('Failed to submit bug report. Please try again.');
        }
    };

    // Reset forms when dialog closes or opens
    useEffect(() => {
        if (!open) {
            suggestionForm.reset();
            bugForm.reset();
        }
    }, [open, suggestionForm, bugForm]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm" className="mt-4 w-full">
                        <Lightbulb className="mr-2 size-3.5" /> Share Feedback
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="p-4 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {feedbackType === 'suggestion' ? (
                            <>
                                <Lightbulb className="size-5" /> Share Your
                                Suggestion
                            </>
                        ) : (
                            <>
                                <Bug className="size-5" /> Report a Bug
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        We value your input! Please help us improve PraxisNotes.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue={feedbackType}
                    onValueChange={(value) => {
                        setFeedbackType(value as FeedbackType);
                    }}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
                        <TabsTrigger value="bug">Bug Report</TabsTrigger>
                    </TabsList>

                    {/* Suggestion Tab Content */}
                    <TabsContent
                        value="suggestion"
                        className="max-h-[60vh] overflow-y-auto"
                    >
                        <Form {...suggestionForm}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void suggestionForm.handleSubmit(
                                        onSubmitSuggestion,
                                    )(e);
                                }}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 py-4 pr-3">
                                    <FormField
                                        control={suggestionForm.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Suggestion Type
                                                </FormLabel>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select suggestion type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {SUGGESTION_TYPES.map(
                                                                (type) => (
                                                                    <SelectItem
                                                                        key={
                                                                            type.value
                                                                        }
                                                                        value={
                                                                            type.value
                                                                        }
                                                                    >
                                                                        {
                                                                            type.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={
                                                            handleAddSuggestionType
                                                        }
                                                        disabled={!field.value}
                                                    >
                                                        <Plus className="size-4" />
                                                        <span className="sr-only">
                                                            Add to suggestion
                                                        </span>
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={suggestionForm.control}
                                        name="text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Your Suggestion *
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Share your suggestion here..."
                                                        className="h-32 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={suggestionIsSubmitting}
                                    >
                                        <Send className="mr-2 size-3.5" />
                                        {suggestionIsSubmitting
                                            ? 'Submitting...'
                                            : 'Submit Suggestion'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    {/* Bug Report Tab Content */}
                    <TabsContent
                        value="bug"
                        className="max-h-[60vh] overflow-y-auto"
                    >
                        <Form {...bugForm}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void bugForm.handleSubmit(
                                        onSubmitBugReport,
                                    )(e);
                                }}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 py-4 pr-3">
                                    <FormField
                                        control={bugForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Brief description of the issue"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bugForm.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select area" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {APP_AREAS.map(
                                                            (area) => (
                                                                <SelectItem
                                                                    key={
                                                                        area.value
                                                                    }
                                                                    value={
                                                                        area.value
                                                                    }
                                                                >
                                                                    {area.label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bugForm.control}
                                        name="severity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Severity</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select severity" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {BUG_SEVERITY.map(
                                                            (severity) => (
                                                                <SelectItem
                                                                    key={
                                                                        severity.value
                                                                    }
                                                                    value={
                                                                        severity.value
                                                                    }
                                                                >
                                                                    {
                                                                        severity.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bugForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description *
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Detailed description of the bug..."
                                                        className="h-24 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bugForm.control}
                                        name="stepsToReproduce"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Steps to Reproduce
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                                                        className="h-24 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Screenshot field needs careful handling with react-hook-form */}
                                    <FormField
                                        control={bugForm.control}
                                        name="screenshot"
                                        render={({
                                            field: { onChange, value, ...rest },
                                        }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Screenshot (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="cursor-pointer"
                                                            onChange={(e) => {
                                                                handleFileChange(
                                                                    e,
                                                                ); // Use existing handler to update form value
                                                                onChange(
                                                                    e.target
                                                                        .files?.[0],
                                                                ); // RHF specific
                                                            }}
                                                            {...rest}
                                                        />
                                                        {value && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {typeof value ===
                                                                'string'
                                                                    ? value
                                                                    : value.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        disabled={bugIsSubmitting}
                                    >
                                        <Bug className="mr-2 size-3.5" />
                                        {bugIsSubmitting
                                            ? 'Submitting...'
                                            : 'Submit Bug Report'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
