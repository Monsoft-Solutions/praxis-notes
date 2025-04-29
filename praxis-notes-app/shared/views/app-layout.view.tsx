import { SidebarInset, SidebarProvider, SidebarTrigger } from '@ui/sidebar.ui';

import { Separator } from '@shared/ui/separator.ui';

import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from '@shared/ui/breadcrumb.ui';

import { ThemeSelector } from '@shared/ui/theme-selector.ui';

import { AppSidebar } from '@shared/components/app-sidebar.component';
import { SupportDropdown } from '@src/contact-center/components';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider className="h-screen w-screen">
            <AppSidebar />

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />

                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    PraxisNotes
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator className="hidden md:block" />

                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="ml-auto flex items-center gap-2">
                        <ThemeSelector type="dropdown" />
                        <SupportDropdown />
                    </div>
                </header>

                <main className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
