import { Link } from '@tanstack/react-router';

import { Power } from 'lucide-react';

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
    SidebarMenuAction,
} from '@ui/sidebar.ui';

import { Route } from '@routes/__root';

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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {
        auth: { logOut },
    } = Route.useRouteContext();

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
                        <SidebarMenuButton onClick={() => void logOut()}>
                            Log Out
                            <SidebarMenuAction className="opacity-100">
                                <Power className="stroke-destructive size-4 stroke-2" />
                            </SidebarMenuAction>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
