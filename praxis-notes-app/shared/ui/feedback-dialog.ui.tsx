import { useState } from 'react';
import { Lightbulb, Send, Plus, Bug } from 'lucide-react';

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
import { Label } from '@ui/label.ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs.ui';
import { Input } from '@ui/input.ui';

// Predefined suggestion types that users can select from
const SUGGESTION_TYPES = [
    { value: 'feature', label: 'New Feature' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'ux', label: 'User Experience' },
    { value: 'performance', label: 'Performance' },
    { value: 'other', label: 'Other' },
];

// Predefined bug severity levels
const BUG_SEVERITY = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

// Application areas where bugs might occur
const APP_AREAS = [
    { value: 'notes', label: 'Notes' },
    { value: 'auth', label: 'Authentication' },
    { value: 'ui', label: 'User Interface' },
    { value: 'sync', label: 'Synchronization' },
    { value: 'search', label: 'Search' },
    { value: 'other', label: 'Other' },
];

type FeedbackType = 'suggestion' | 'bug';

type FeedbackDialogProps = {
    trigger?: React.ReactNode;
    initialType?: FeedbackType;
};

export function FeedbackDialog({
    trigger,
    initialType = 'suggestion',
}: FeedbackDialogProps) {
    const [open, setOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);

    // Suggestion form data
    const [suggestionData, setSuggestionData] = useState({
        text: '',
        type: '',
    });

    // Bug report form data
    const [bugData, setBugData] = useState({
        title: '',
        description: '',
        stepsToReproduce: '',
        area: '',
        severity: '',
        screenshot: null as File | null,
    });

    const handleSuggestionChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { id, value } = e.target;
        setSuggestionData((prev) => ({
            ...prev,
            [id.replace('suggestion-', '')]: value,
        }));
    };

    const handleBugChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { id, value } = e.target;
        setBugData((prev) => ({
            ...prev,
            [id.replace('bug-', '')]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBugData((prev) => ({
                ...prev,
                screenshot: e.target.files?.[0] ?? null,
            }));
        }
    };

    const handleSuggestionTypeChange = (value: string) => {
        setSuggestionData((prev) => ({
            ...prev,
            type: value,
        }));
    };

    const handleBugAreaChange = (value: string) => {
        setBugData((prev) => ({
            ...prev,
            area: value,
        }));
    };

    const handleBugSeverityChange = (value: string) => {
        setBugData((prev) => ({
            ...prev,
            severity: value,
        }));
    };

    const handleAddSuggestionType = () => {
        if (!suggestionData.type) return;

        const selectedType = SUGGESTION_TYPES.find(
            (type) => type.value === suggestionData.type,
        );
        if (!selectedType) return;

        const typeText = `[${selectedType.label}] `;

        // Add the suggestion type to the beginning of the text if it's not already there
        if (!suggestionData.text.includes(typeText)) {
            setSuggestionData((prev) => ({
                ...prev,
                text: typeText + prev.text,
            }));
        }
    };

    const handleSubmitSuggestion = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle the submission of the suggestion
        console.log('Suggestion submitted:', suggestionData);

        // Reset form and close dialog
        setSuggestionData({ text: '', type: '' });
        setOpen(false);
    };

    const handleSubmitBugReport = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle the submission of the bug report
        console.log('Bug report submitted:', bugData);

        // Reset form and close dialog
        setBugData({
            title: '',
            description: '',
            stepsToReproduce: '',
            area: '',
            severity: '',
            screenshot: null,
        });
        setOpen(false);
    };

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
                        <form onSubmit={handleSubmitSuggestion}>
                            <div className="grid gap-4 py-4 pr-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="suggestion-type">
                                        Suggestion Type
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={suggestionData.type}
                                            onValueChange={
                                                handleSuggestionTypeChange
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select suggestion type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUGGESTION_TYPES.map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={handleAddSuggestionType}
                                            disabled={!suggestionData.type}
                                        >
                                            <Plus className="size-4" />
                                            <span className="sr-only">
                                                Add to suggestion
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="suggestion-text">
                                        Your Suggestion *
                                    </Label>
                                    <Textarea
                                        id="suggestion-text"
                                        value={suggestionData.text}
                                        onChange={handleSuggestionChange}
                                        placeholder="Share your suggestion here..."
                                        className="h-32 resize-none"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    <Send className="mr-2 size-3.5" /> Submit
                                    Suggestion
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    {/* Bug Report Tab Content */}
                    <TabsContent
                        value="bug"
                        className="max-h-[60vh] overflow-y-auto"
                    >
                        <form onSubmit={handleSubmitBugReport}>
                            <div className="grid gap-4 py-4 pr-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="bug-title">Title *</Label>
                                    <Input
                                        id="bug-title"
                                        value={bugData.title}
                                        onChange={handleBugChange}
                                        placeholder="Brief description of the issue"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="bug-area">Area</Label>
                                        <Select
                                            value={bugData.area}
                                            onValueChange={handleBugAreaChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {APP_AREAS.map((area) => (
                                                    <SelectItem
                                                        key={area.value}
                                                        value={area.value}
                                                    >
                                                        {area.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bug-severity">
                                            Severity
                                        </Label>
                                        <Select
                                            value={bugData.severity}
                                            onValueChange={
                                                handleBugSeverityChange
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select severity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUG_SEVERITY.map(
                                                    (severity) => (
                                                        <SelectItem
                                                            key={severity.value}
                                                            value={
                                                                severity.value
                                                            }
                                                        >
                                                            {severity.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bug-description">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="bug-description"
                                        value={bugData.description}
                                        onChange={handleBugChange}
                                        placeholder="Detailed description of the bug..."
                                        className="h-24 resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bug-stepsToReproduce">
                                        Steps to Reproduce
                                    </Label>
                                    <Textarea
                                        id="bug-stepsToReproduce"
                                        value={bugData.stepsToReproduce}
                                        onChange={handleBugChange}
                                        placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                                        className="h-24 resize-none"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bug-screenshot">
                                        Screenshot (optional)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="bug-screenshot"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="cursor-pointer"
                                        />
                                        {bugData.screenshot && (
                                            <div className="text-muted-foreground text-xs">
                                                {bugData.screenshot.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    <Bug className="mr-2 size-3.5" /> Submit Bug
                                    Report
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
