import { HTMLAttributes } from 'react';

import {
    LifeBuoy,
    Lightbulb,
    Phone,
    Mail,
    HelpCircle,
    Home,
    Send,
    Bug,
} from 'lucide-react';

import { Button } from '@ui/button.ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';
import { Input } from '@ui/input.ui';
import { Textarea } from '@ui/textarea.ui';
import { Label } from '@ui/label.ui';
import { Separator } from '@ui/separator.ui';
import { FeedbackDialog } from '@ui/feedback-dialog.ui';

type SupportDropdownProps = HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'outline' | 'ghost';
};

export function SupportDropdown({
    className,
    align = 'end',
    size = 'icon',
    variant = 'outline',
    ...props
}: SupportDropdownProps) {
    // Prevent dropdown from closing when interacting with form elements
    const stopPropagation = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };
    const preventDefault = (e: React.SyntheticEvent) => {
        e.preventDefault();
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant={variant} size={size} className="w-9 p-0">
                        <LifeBuoy className="size-[1.2rem]" />
                        <span className="sr-only">Open support menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align={align}
                    className="max-h-[90vh] w-screen overflow-y-auto p-4 md:max-h-[calc(100vh-4rem)] md:w-auto md:max-w-2xl"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Feedback & Suggestion Section */}
                        <div className="col-span-1 flex flex-col">
                            <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold">
                                <Lightbulb className="size-4" /> FEEDBACK &
                                SUGGESTIONS
                            </DropdownMenuLabel>
                            <p className="text-muted-foreground mt-2 text-xs">
                                Any suggestions for improving PraxisNotes? We
                                would be happy to hear from you. Fine-tuning our
                                platform will make your work easier.
                            </p>
                            <div className="mt-4 flex flex-col gap-2">
                                <FeedbackDialog
                                    initialType="suggestion"
                                    trigger={
                                        <Button size="sm" className="w-full">
                                            <Lightbulb className="mr-2 size-3.5" />{' '}
                                            Share a suggestion
                                        </Button>
                                    }
                                />
                                <FeedbackDialog
                                    initialType="bug"
                                    trigger={
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Bug className="mr-2 size-3.5" />{' '}
                                            Report a bug
                                        </Button>
                                    }
                                />
                            </div>
                        </div>

                        <Separator className="md:hidden" />

                        {/* Support Center Section */}
                        <div className="col-span-1 flex flex-col">
                            <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold">
                                <LifeBuoy className="size-4" /> SUPPORT CENTER
                            </DropdownMenuLabel>
                            <p className="text-muted-foreground mt-2 text-xs">
                                If you have any questions, please contact us at
                                your earliest convenience.
                            </p>
                            <DropdownMenuGroup className="mt-2">
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                    <Phone className="mr-2 size-3.5" /> Call us
                                    now
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                    <Mail className="mr-2 size-3.5" /> Send us
                                    email
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                    <HelpCircle className="mr-2 size-3.5" />
                                    FAQs
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs">
                                    <Home className="mr-2 size-3.5" /> Welcome
                                    page
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </div>

                        <Separator className="md:hidden" />

                        {/* Send us a message Section */}
                        <div className="col-span-1 flex flex-col">
                            <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold">
                                <Send className="size-4" /> SEND US A MESSAGE
                            </DropdownMenuLabel>
                            <form className="mt-2 space-y-2">
                                <div onClick={stopPropagation}>
                                    <Label
                                        htmlFor="support-name"
                                        className="sr-only"
                                    >
                                        Your Name
                                    </Label>
                                    <Input
                                        id="support-name"
                                        placeholder="Your Name"
                                        className="h-8 text-xs"
                                        onKeyDown={stopPropagation}
                                        onSelect={preventDefault}
                                    />
                                </div>
                                <div onClick={stopPropagation}>
                                    <Label
                                        htmlFor="support-phone"
                                        className="sr-only"
                                    >
                                        Your Phone *
                                    </Label>
                                    <Input
                                        id="support-phone"
                                        placeholder="Your Phone *"
                                        className="h-8 text-xs"
                                        required
                                        onKeyDown={stopPropagation}
                                        onSelect={preventDefault}
                                    />
                                </div>
                                <div onClick={stopPropagation}>
                                    <Label
                                        htmlFor="support-message"
                                        className="sr-only"
                                    >
                                        Message *
                                    </Label>
                                    <Textarea
                                        id="support-message"
                                        placeholder="Message *"
                                        className="h-20 resize-none text-xs"
                                        required
                                        onKeyDown={stopPropagation}
                                        onSelect={preventDefault}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="w-full"
                                    onClick={stopPropagation}
                                >
                                    <Send className="mr-2 size-3.5" /> Send
                                </Button>
                            </form>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
