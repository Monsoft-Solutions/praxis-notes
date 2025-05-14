import { ReactNode, useState } from 'react';
import { Button } from '@shared/ui/button.ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu.ui';
import { Separator } from '@shared/ui/separator.ui';
import {
    Edit,
    Scissors,
    ClipboardList,
    Pencil,
    CheckSquare,
    ImageIcon,
    Eraser,
    ListChecks,
    ScrollText,
    MessageSquarePlus,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@shared/ui/dialog.ui';
import { Textarea } from '@shared/ui/textarea.ui';
import { TransformNoteType } from '../schema/transform-note-type.schema';

type NotesActionsProps = {
    onAction: (actionType: string, customInstructions?: string) => void;
    disabled?: boolean;
};

export type ActionMenuItem = {
    id: TransformNoteType;
    icon: ReactNode;
    label: string;
    group?: string;
};

export function NotesActions({
    onAction,
    disabled = false,
}: NotesActionsProps) {
    const [customInstructions, setCustomInstructions] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmitCustomInstructions = () => {
        onAction('customInstructions', customInstructions);
        setIsDialogOpen(false);
        setCustomInstructions('');
    };

    const improveActions: ActionMenuItem[] = [
        {
            id: 'improve',
            icon: <Edit className="h-4 w-4" />,
            label: 'Improve it',
        },
        {
            id: 'shortenIt',
            icon: <Scissors className="h-4 w-4" />,
            label: 'Shorten it',
        },
        {
            id: 'cleanUp',
            icon: <Eraser className="h-4 w-4" />,
            label: 'Clean up notes',
        },
        {
            id: 'makeDescriptive',
            icon: <Pencil className="h-4 w-4" />,
            label: 'Make it more descriptive',
        },
        {
            id: 'makeDetailed',
            icon: <ImageIcon className="h-4 w-4" />,
            label: 'Make it more detailed',
        },
        {
            id: 'simplify',
            icon: <CheckSquare className="h-4 w-4" />,
            label: 'Simplify it',
        },
        {
            id: 'fixMistakes',
            icon: <ListChecks className="h-4 w-4" />,
            label: 'Fix any mistakes',
        },
        {
            id: 'soundFluent',
            icon: <ScrollText className="h-4 w-4" />,
            label: 'Sound fluent',
        },
        {
            id: 'makeObjective',
            icon: <ClipboardList className="h-4 w-4" />,
            label: 'Make it objective',
        },
    ];

    const audienceActions: ActionMenuItem[] = [];

    return (
        <div className="flex">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="flex items-center gap-1"
                        disabled={disabled}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                    {improveActions.map((action) => (
                        <DropdownMenuItem
                            key={action.id}
                            onClick={() => {
                                onAction(action.id);
                            }}
                            className="flex items-center gap-2 py-2"
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    ))}

                    <Separator className="my-2" />

                    {audienceActions.map((action) => (
                        <DropdownMenuItem
                            key={action.id}
                            onClick={() => {
                                onAction(action.id);
                            }}
                            className="flex items-center gap-2 py-2"
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </DropdownMenuItem>
                    ))}

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsDialogOpen(true);
                                }}
                                className="flex items-center gap-2 py-2"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                <span>Custom instructions</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Custom Instructions</DialogTitle>
                            </DialogHeader>
                            <Textarea
                                placeholder="Enter your custom instructions for transforming the notes..."
                                className="mt-4 min-h-[150px]"
                                value={customInstructions}
                                onChange={(e) => {
                                    setCustomInstructions(e.target.value);
                                }}
                            />
                            <DialogFooter className="mt-4">
                                <Button
                                    onClick={() => {
                                        handleSubmitCustomInstructions();
                                    }}
                                    disabled={!customInstructions.trim()}
                                >
                                    Apply
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
