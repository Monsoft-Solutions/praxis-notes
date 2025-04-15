import { Link } from '@tanstack/react-router';

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
} from '@ui/sidebar.ui';

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

            <SidebarRail />
        </Sidebar>
    );
}
