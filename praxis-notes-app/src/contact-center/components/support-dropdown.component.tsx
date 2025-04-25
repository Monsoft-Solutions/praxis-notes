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
import { Separator } from '@ui/separator.ui';
import { FeedbackDialog } from '@src/contact-center/components/feedback-dialog.component';
import { ContactForm } from './contact-form.component';

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
                    className="max-h-[90vh] w-screen overflow-y-auto p-4 md:max-h-[calc(100vh-4rem)] md:w-auto md:max-w-3xl"
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
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer text-xs"
                                >
                                    <a href="tel:+13057974357">
                                        <Phone className="mr-2 size-3.5" /> Call
                                        us now
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer text-xs"
                                >
                                    <a href="mailto:support@praxisnotes.com">
                                        <Mail className="mr-2 size-3.5" /> Send
                                        us email
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer text-xs"
                                >
                                    <a
                                        href="https://docs.praxisnotes.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <HelpCircle className="mr-2 size-3.5" />
                                        Guides
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    className="cursor-pointer text-xs"
                                >
                                    <a
                                        href="https://www.praxisnotes.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Home className="mr-2 size-3.5" />{' '}
                                        Website
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </div>

                        <Separator className="md:hidden" />

                        {/* Send us a message Section */}
                        <div className="col-span-1 flex flex-col">
                            <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold">
                                <Send className="size-4" /> SEND US A MESSAGE
                            </DropdownMenuLabel>
                            <ContactForm className="mt-2" />
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
