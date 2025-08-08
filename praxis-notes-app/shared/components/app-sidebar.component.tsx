import { Link } from '@tanstack/react-router';

import {
    Power,
    LayoutDashboard,
    Users,
    MessageCircle,
    CreditCard,
    Settings,
    User2,
    ChevronsUpDown,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarFooter,
} from '@ui/sidebar.ui';

import { Route } from '@routes/__root';

import { TourStepId } from '@shared/types/tour-step-id.type';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu.ui';
import { authClient } from '@auth/providers/web/auth-client.provider';
import { useState, useEffect } from 'react';

type NavItem = {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
};

type NavSection =
    | {
          title: string;
          items: NavItem[];
      }
    | {
          title: string;
          url: string;
          icon?: React.ReactNode;
      };

const navbarSections: NavSection[] = [
    {
        title: 'Main',
        items: [
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: <LayoutDashboard className="size-4 stroke-2" />,
            },
            {
                title: 'Clients',
                url: '/clients',
                icon: <Users className="size-4 stroke-2" />,
            },
        ],
    },

    {
        title: 'Chat',
        url: '/chat',
        icon: <MessageCircle className="size-4 stroke-2" />,
    },
];

const clientItemId: TourStepId = 'client-sidebar-item';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [userBasicData, setUserBasicData] = useState({
        name: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        const getLoggedInUser = async () => {
            const { data: session } = await authClient.getSession();

            if (session) {
                setUserBasicData({
                    name: session.user.name,
                    lastName: session.user.lastName ?? '',
                    email: session.user.email,
                });
            }
        };

        void getLoggedInUser();
    }, []);

    const {
        auth: { logOut },
    } = Route.useRouteContext();

    return (
        <div className="relative h-full bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100">
            {/* Subtle background decorations (2-3 max, hidden on mobile) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Large dashed circle */}
                <div
                    className="absolute right-6 top-24 hidden h-12 w-12 transform rounded-full border-2 border-blue-200 opacity-25 sm:block"
                    style={{
                        borderStyle: 'dashed',
                        borderRadius: '60% 40% 65% 35%',
                        transform: 'rotate(0.1deg)',
                    }}
                ></div>
                {/* Soft green square */}
                <div className="absolute bottom-28 left-6 hidden h-8 w-8 rounded border-2 border-green-200 opacity-25 sm:block"></div>
                {/* Small orange dot */}
                <div className="absolute bottom-16 left-1/3 hidden h-2.5 w-2.5 rounded-full bg-orange-200 opacity-60 sm:block"></div>
            </div>

            <Sidebar {...props} className="border-0 bg-transparent">
                <SidebarHeader className="p-4">
                    <div
                        className="relative rounded-3xl border-2 border-blue-200 bg-white p-4 shadow-lg"
                        style={{
                            borderStyle: 'solid',
                            borderRadius: '25px 30px 20px 35px',
                        }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform rounded-full border-2 border-white bg-blue-400 sm:h-5 sm:w-5"></div>
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400 sm:h-3 sm:w-3"></div>
                        <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-green-400 sm:h-3 sm:w-3"></div>

                        <div className="pt-2">
                            <h2
                                className="font-quicksand text-base font-bold text-gray-800 sm:text-lg"
                                style={{
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                }}
                            >
                                Praxis Notes
                            </h2>
                            <p className="font-nunito text-xs text-gray-600 sm:text-sm">
                                ABA Data Platform
                            </p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="space-y-4 px-4">
                    {navbarSections.map((item) => {
                        if ('items' in item) {
                            return (
                                <div key={item.title}>
                                    <div
                                        className={`relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-lg transition-all duration-200 hover:shadow-md`}
                                        style={{
                                            borderStyle: 'dashed',
                                            borderRadius: '30px 20px 35px 25px',
                                        }}
                                    >
                                        {/* Decorative elements */}
                                        <div className="absolute -top-1 left-6 h-3 w-3 rounded-full border border-white bg-yellow-400 sm:h-4 sm:w-4"></div>
                                        <div className="absolute -right-1 top-4 h-2 w-2 rounded-full bg-green-400 sm:h-3 sm:w-3"></div>

                                        <div className="pt-2">
                                            <h3 className="font-quicksand mb-3 px-2 text-xs font-semibold text-gray-700 sm:text-sm">
                                                {item.title}
                                            </h3>

                                            <div className="space-y-2">
                                                {item.items.map(
                                                    (
                                                        {
                                                            title,
                                                            url,
                                                            icon,
                                                        }: {
                                                            title: string;
                                                            url: string;
                                                            icon?: React.ReactNode;
                                                        },
                                                        itemIndex: number,
                                                    ) => (
                                                        <Link
                                                            key={title}
                                                            to={url}
                                                            className="group block"
                                                        >
                                                            <div
                                                                className={`font-quicksand flex transform items-center gap-3 rounded-xl border-2 border-blue-200 bg-white p-3 font-semibold text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md ${itemIndex % 2 === 0 ? 'rotate-[0.2deg]' : '-rotate-[0.2deg]'}`}
                                                                style={{
                                                                    borderStyle:
                                                                        'solid',
                                                                    borderRadius:
                                                                        '20px 15px 25px 18px',
                                                                }}
                                                            >
                                                                <div className="text-blue-600">
                                                                    {icon}
                                                                </div>
                                                                <span
                                                                    className="text-sm"
                                                                    id={
                                                                        title ===
                                                                        'Clients'
                                                                            ? clientItemId
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {title}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={item.title}>
                                    <div
                                        className="relative rounded-3xl border-2 border-orange-200 bg-white p-4 shadow-lg transition-all duration-200 hover:shadow-md"
                                        style={{
                                            borderStyle: 'solid',
                                            borderRadius: '25px 15px 30px 20px',
                                        }}
                                    >
                                        {/* Decorative elements */}
                                        <div className="absolute -left-1 bottom-6 h-3 w-3 rounded-full border border-white bg-orange-400 sm:h-4 sm:w-4"></div>
                                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400"></div>

                                        <div className="pt-2">
                                            <Link
                                                to={item.url}
                                                className="block"
                                            >
                                                <div
                                                    className="font-quicksand relative flex rotate-[0.2deg] transform items-center gap-3 rounded-xl border-2 border-orange-200 bg-white p-3 font-semibold text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-md"
                                                    style={{
                                                        borderStyle: 'solid',
                                                        borderRadius:
                                                            '20px 15px 25px 18px',
                                                    }}
                                                >
                                                    <div className="text-orange-600">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-sm">
                                                        {item.title}
                                                    </span>

                                                    {/* Subtle attention animation for Chat button */}
                                                    {item.url === '/chat' && (
                                                        <>
                                                            <span
                                                                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500"
                                                                aria-hidden
                                                            ></span>
                                                            <span
                                                                className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full bg-orange-400 opacity-60"
                                                                style={{
                                                                    animationDuration:
                                                                        '2.5s',
                                                                }}
                                                                aria-hidden
                                                            ></span>
                                                        </>
                                                    )}
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </SidebarContent>

                <SidebarFooter className="p-4">
                    <div
                        className="relative rounded-3xl border-2 border-yellow-300 bg-white p-4 shadow-lg"
                        style={{
                            borderStyle: 'solid',
                            borderRadius: '20px 30px 15px 25px',
                        }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute -top-1 right-6 h-3 w-3 rounded-full border border-white bg-yellow-400"></div>
                        <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-orange-400"></div>

                        <div className="pt-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="font-quicksand flex w-full items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-3 font-semibold text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
                                        style={{
                                            borderStyle: 'solid',
                                            borderRadius: '15px 20px 15px 25px',
                                        }}
                                    >
                                        <div className="text-gray-600">
                                            <User2 className="size-4" />
                                        </div>
                                        <div className="flex flex-1 flex-col text-left">
                                            <span className="text-sm">
                                                {userBasicData.name}{' '}
                                                {userBasicData.lastName}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {userBasicData.email}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4 text-gray-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width] rounded-xl border-2 border-gray-200 bg-white"
                                    style={{
                                        borderRadius: '12px 16px 12px 18px',
                                    }}
                                >
                                    <DropdownMenuItem className="p-0">
                                        <Link to="/account" className="w-full">
                                            <div
                                                className="font-quicksand flex items-center gap-3 rounded-lg p-3 font-medium transition-colors hover:bg-blue-50"
                                                style={{
                                                    borderRadius:
                                                        '8px 12px 8px 15px',
                                                }}
                                            >
                                                <Settings className="size-4 stroke-2 text-blue-500" />
                                                <span className="text-gray-800">
                                                    Account
                                                </span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-0">
                                        <Link to="/pricing" className="w-full">
                                            <div
                                                className="font-quicksand flex items-center gap-3 rounded-lg p-3 font-medium transition-colors hover:bg-green-50"
                                                style={{
                                                    borderRadius:
                                                        '8px 12px 8px 15px',
                                                }}
                                            >
                                                <CreditCard className="size-4 stroke-2 text-green-500" />
                                                <span className="text-gray-800">
                                                    Billing
                                                </span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-0">
                                        <button
                                            onClick={() => void logOut()}
                                            className="font-quicksand flex w-full items-center gap-3 rounded-lg p-3 font-medium transition-colors hover:bg-red-50"
                                            style={{
                                                borderRadius:
                                                    '8px 12px 8px 15px',
                                            }}
                                        >
                                            <Power className="size-4 stroke-red-500 stroke-2" />
                                            <span className="text-gray-800">
                                                Log Out
                                            </span>
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        </div>
    );
}
