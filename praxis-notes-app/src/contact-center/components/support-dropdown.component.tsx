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
import { BORDER_RADIUS } from '@shared/constants/design-tokens.constant';

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
                    <Button
                        variant={variant}
                        size={size}
                        className="hand-drawn-button w-9 border-2 border-green-200 bg-green-50 p-0 text-green-600 hover:bg-green-100"
                        style={{
                            borderRadius: BORDER_RADIUS.button.primary,
                        }}
                    >
                        <LifeBuoy className="size-[1.2rem]" />
                        <span className="sr-only">Open support menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align={align}
                    className="relative max-h-[90vh] w-screen overflow-y-auto border-2 border-green-200 bg-white p-4 shadow-lg md:max-h-[calc(100vh-4rem)] md:w-auto md:max-w-3xl"
                    style={{
                        borderRadius: BORDER_RADIUS.panel.xl,
                    }}
                >
                    {/* Thumb tack for dropdown */}
                    <div className="absolute -top-2 right-8 h-3 w-3 rotate-45 transform bg-green-400 shadow-sm"></div>

                    <div className="pt-2">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Feedback & Suggestion Section */}
                            <div
                                className="col-span-1 flex flex-col border-2 border-yellow-200 bg-yellow-50 p-4"
                                style={{
                                    borderRadius: BORDER_RADIUS.panel.lg,
                                }}
                            >
                                <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold text-yellow-800">
                                    <Lightbulb className="size-4 text-yellow-600" />{' '}
                                    FEEDBACK & SUGGESTIONS
                                </DropdownMenuLabel>
                                <p className="text-hand-drawn-body mt-2 text-xs text-yellow-700">
                                    Any suggestions for improving PraxisNotes?
                                    We would be happy to hear from you.
                                    Fine-tuning our platform will make your work
                                    easier.
                                </p>
                                <div className="mt-4 flex flex-col gap-2">
                                    <FeedbackDialog
                                        initialType="suggestion"
                                        trigger={
                                            <Button
                                                size="sm"
                                                className="hand-drawn-button w-full border-2 border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                style={{
                                                    borderRadius:
                                                        BORDER_RADIUS.button
                                                            .alt,
                                                }}
                                            >
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
                                                className="hand-drawn-button w-full border-2 border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
                                                style={{
                                                    borderRadius:
                                                        BORDER_RADIUS.button
                                                            .outline,
                                                }}
                                            >
                                                <Bug className="mr-2 size-3.5" />{' '}
                                                Report a bug
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>

                            <Separator className="border-green-200 md:hidden" />

                            {/* Support Center Section */}
                            <div
                                className="col-span-1 flex flex-col border-2 border-blue-200 bg-blue-50 p-4"
                                style={{
                                    borderRadius: BORDER_RADIUS.panel.md,
                                }}
                            >
                                <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold text-blue-800">
                                    <LifeBuoy className="size-4 text-blue-600" />{' '}
                                    SUPPORT CENTER
                                </DropdownMenuLabel>
                                <p className="text-hand-drawn-body mt-2 text-xs text-blue-700">
                                    If you have any questions, please contact us
                                    at your earliest convenience.
                                </p>
                                <DropdownMenuGroup className="mt-2 space-y-1">
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer border-2 border-blue-300 bg-blue-100 text-xs transition-colors hover:bg-blue-200"
                                        style={{
                                            borderRadius:
                                                BORDER_RADIUS.menuItem.a,
                                        }}
                                    >
                                        <a
                                            href="tel:+13057974357"
                                            className="text-hand-drawn-interactive text-blue-800"
                                        >
                                            <Phone className="mr-2 size-3.5 text-blue-600" />{' '}
                                            Call us now
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer border-2 border-blue-300 bg-blue-100 text-xs transition-colors hover:bg-blue-200"
                                        style={{
                                            borderRadius:
                                                BORDER_RADIUS.menuItem.b,
                                        }}
                                    >
                                        <a
                                            href="mailto:support@praxisnotes.com"
                                            className="text-hand-drawn-interactive text-blue-800"
                                        >
                                            <Mail className="mr-2 size-3.5 text-blue-600" />{' '}
                                            Send us email
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer border-2 border-blue-300 bg-blue-100 text-xs transition-colors hover:bg-blue-200"
                                        style={{
                                            borderRadius:
                                                BORDER_RADIUS.menuItem.c,
                                        }}
                                    >
                                        <a
                                            href="https://docs.praxisnotes.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-hand-drawn-interactive text-blue-800"
                                        >
                                            <HelpCircle className="mr-2 size-3.5 text-blue-600" />
                                            Guides
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer border-2 border-blue-300 bg-blue-100 text-xs transition-colors hover:bg-blue-200"
                                        style={{
                                            borderRadius:
                                                BORDER_RADIUS.menuItem.d,
                                        }}
                                    >
                                        <a
                                            href="https://www.praxisnotes.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-hand-drawn-interactive text-blue-800"
                                        >
                                            <Home className="mr-2 size-3.5 text-blue-600" />{' '}
                                            Website
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </div>

                            <Separator className="border-green-200 md:hidden" />

                            {/* Send us a message Section */}
                            <div
                                className="col-span-1 flex flex-col border-2 border-orange-200 bg-orange-50 p-4"
                                style={{
                                    borderRadius: BORDER_RADIUS.panel.orange,
                                }}
                            >
                                <DropdownMenuLabel className="flex items-center gap-2 px-0 text-sm font-semibold text-orange-800">
                                    <Send className="size-4 text-orange-600" />{' '}
                                    SEND US A MESSAGE
                                </DropdownMenuLabel>
                                <ContactForm className="mt-2" />
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
