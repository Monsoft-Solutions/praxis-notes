import { Link } from '@tanstack/react-router';

import { ChevronUp, Power, Settings, Trash } from 'lucide-react';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu.ui';
import { api } from '@api/providers/web';

import { toast } from 'sonner';

type NavItem = {
    title: string;
    url: string;
    isActive?: boolean;
};

type NavSection = {
    title: string;
    items: NavItem[];
};

// This is sample data.
const navbarSections: NavSection[] = [
    {
        title: 'Main',

        items: [
            {
                title: 'Dashboard',
                url: '/dashboard',
            },

            {
                title: 'Clients',
                url: '/clients',
            },
        ],
    },

    {
        title: 'Admin',

        items: [
            {
                title: 'Antecedents',
                url: '/antecedents',
            },

            {
                title: 'Behaviors',
                url: '/behaviors',
            },

            {
                title: 'Interventions',
                url: '/interventions',
            },

            {
                title: 'Replacement Programs',
                url: '/replacement-programs',
            },
        ],
    },

    {
        title: 'Subscription',

        items: [
            {
                title: 'Pricing',
                url: '/pricing',
            },

            {
                title: 'Account',
                url: '/account',
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { mutateAsync: deleteOrganization } =
        api.auth.deleteOrganization.useMutation();

    const {
        auth: { logOut },
    } = Route.useRouteContext();

    const handleDeleteOrganization = async () => {
        const { error } = await deleteOrganization();

        if (error) {
            toast.error('Error deleting organization');
            return;
        }

        toast.success('Organization deleted');

        await logOut();
    };

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
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                {item.title}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
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
                    </SidebarMenuItem>

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
