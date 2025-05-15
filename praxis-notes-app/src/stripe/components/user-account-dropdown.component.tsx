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
            try {
                const { data: session } = await authClient.getSession();

                if (mounted && session) {
                    setUserBasicData({
                        name: session.user.name,
                        lastName: session.user.lastName ?? '',
                        email: session.user.email,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user session:', error);
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
                    <Button variant={variant} size={size} className="p-0">
                        <User2 className="size-[1.2rem]" />
                        <span className="sr-only">Open account menu</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align={align} className="w-[260px] p-2">
                    <div className="mb-2 flex items-center gap-2 p-2">
                        <User2 className="size-4" />
                        <div className="flex flex-col">
                            <span>
                                {userBasicData.name} {userBasicData.lastName}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {userBasicData.email}
                            </span>
                        </div>
                    </div>

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <a
                                href="/account"
                                className="flex w-full cursor-pointer items-center gap-2 p-2"
                            >
                                <Settings className="size-4 stroke-2" />
                                <span>Account</span>
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <a
                                href="/pricing"
                                className="flex w-full cursor-pointer items-center gap-2 p-2"
                            >
                                <CreditCard className="size-4 stroke-2" />
                                <span>Billing</span>
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 p-2"
                            onClick={onLogOut}
                        >
                            <Power className="stroke-destructive size-4 stroke-2" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
