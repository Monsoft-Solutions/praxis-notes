import { Link } from '@tanstack/react-router';

import {
    Power,
    LayoutDashboard,
    Users,
    MessageCircle,
    CreditCard,
    User,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from '@ui/sidebar.ui';

import { Route } from '@routes/__root';

import { TourStepId } from '@shared/types/tour-step-id.type';

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

// This is sample data.
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

    // {
    //     title: 'Admin',

    //     items: [
    //         {
    //             title: 'Antecedents',
    //             url: '/antecedents',
    //         },

    //         {
    //             title: 'Behaviors',
    //             url: '/behaviors',
    //         },

    //         {
    //             title: 'Interventions',
    //             url: '/interventions',
    //         },

    //         {
    //             title: 'Replacement Programs',
    //             url: '/replacement-programs',
    //         },
    //     ],
    // },

    {
        title: 'Chat',
        url: '/chat',
        icon: <MessageCircle className="size-4 stroke-2" />,
    },
    {
        title: 'Subscription',

        items: [
            {
                title: 'Pricing',
                url: '/pricing',
                icon: <CreditCard className="size-4 stroke-2" />,
            },

            {
                title: 'Account',
                url: '/account',
                icon: <User className="size-4 stroke-2" />,
            },
        ],
    },
];

const clientItemId: TourStepId = 'client-sidebar-item';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {
        auth: { logOut },
    } = Route.useRouteContext();

    // const handleDeleteOrganization = async () => {
    //     const { error } = await deleteOrganization();

    //     if (error) {
    //         toast.error('Error deleting organization');
    //         return;
    //     }

    //     toast.success('Organization deleted');

    //     await logOut();
    // };

    return (
        <Sidebar {...props}>
            <SidebarHeader></SidebarHeader>

            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {navbarSections.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {'items' in item ? (
                                    item.items.map(({ title, url, icon }) => (
                                        <SidebarMenuItem key={title}>
                                            <SidebarMenuButton asChild>
                                                <Link to={url}>
                                                    {icon}
                                                    <span
                                                        id={
                                                            title === 'Clients'
                                                                ? clientItemId
                                                                : undefined
                                                        }
                                                    >
                                                        {title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                ) : (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {/* <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Settings /> Settings
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        void handleDeleteOrganization();
                                    }}
                                >
                                    Delete Account
                                    <DropdownMenuShortcut className="opacity-100">
                                        <Trash className="size-4 stroke-2" />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem> */}

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => void logOut()}>
                            <Power className="stroke-destructive size-4 stroke-2" />
                            Log Out
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
