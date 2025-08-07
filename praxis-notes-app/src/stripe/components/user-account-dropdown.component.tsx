import { HTMLAttributes, useState, useEffect } from 'react';
import { User2, Settings, CreditCard, Power } from 'lucide-react';

import { Button } from '@ui/button.ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu.ui';
import { authClient } from '@auth/providers/web/auth-client.provider';

type UserAccountDropdownProps = HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'outline' | 'ghost';
    onLogOut: () => void;
};

export function UserAccountDropdown({
    className,
    align = 'end',
    size = 'icon',
    variant = 'outline',
    onLogOut,
    ...props
}: UserAccountDropdownProps) {
    const [userBasicData, setUserBasicData] = useState({
        name: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        let mounted = true;

        const getLoggedInUser = async () => {
            const { data: session } = await authClient.getSession();

            if (session && mounted) {
                setUserBasicData({
                    name: session.user.name,
                    lastName: session.user.lastName ?? '',
                    email: session.user.email,
                });
            }
        };

        void getLoggedInUser();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className={className} {...props}>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        className="hand-drawn-button border-2 border-blue-200 bg-blue-50 p-0 text-blue-600 hover:bg-blue-100"
                        style={{
                            borderRadius: '12px 14px 12px 16px',
                        }}
                    >
                        <User2 className="size-[1.2rem]" />
                        <span className="sr-only">Open account menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align={align}
                    className="relative w-[280px] border-2 border-blue-200 bg-white p-2 shadow-lg"
                    style={{
                        borderRadius: '25px 30px 20px 35px',
                    }}
                >
                    {/* Thumb tack for dropdown */}
                    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                        <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                    </div>

                    <div className="pt-2">
                        {/* User info section */}
                        <div
                            className="mb-3 flex items-center gap-2 border-2 border-blue-100 bg-blue-50 p-3"
                            style={{
                                borderRadius: '15px 18px 12px 20px',
                            }}
                        >
                            <User2 className="size-4 text-blue-600" />
                            <div className="flex flex-col">
                                <span className="text-hand-drawn-interactive text-gray-800">
                                    {userBasicData.name}{' '}
                                    {userBasicData.lastName}
                                </span>
                                <span className="text-hand-drawn-body text-muted-foreground text-xs">
                                    {userBasicData.email}
                                </span>
                            </div>
                        </div>

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <a
                                    href="/account"
                                    className="flex w-full cursor-pointer items-center gap-2 border-2 border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100"
                                    style={{
                                        borderRadius: '12px 15px 10px 18px',
                                    }}
                                >
                                    <Settings className="size-4 stroke-2 text-green-600" />
                                    <span className="text-hand-drawn-interactive text-gray-800">
                                        Account
                                    </span>
                                </a>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <a
                                    href="/pricing"
                                    className="flex w-full cursor-pointer items-center gap-2 border-2 border-orange-200 bg-orange-50 p-3 transition-colors hover:bg-orange-100"
                                    style={{
                                        borderRadius: '10px 18px 15px 12px',
                                    }}
                                >
                                    <CreditCard className="size-4 stroke-2 text-orange-600" />
                                    <span className="text-hand-drawn-interactive text-gray-800">
                                        Billing
                                    </span>
                                </a>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2 border-2 border-red-200 bg-red-50 p-3 transition-colors hover:bg-red-100"
                                onClick={onLogOut}
                                style={{
                                    borderRadius: '18px 12px 15px 10px',
                                }}
                            >
                                <Power className="size-4 stroke-2 text-red-600" />
                                <span className="text-hand-drawn-interactive text-gray-800">
                                    Log Out
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
