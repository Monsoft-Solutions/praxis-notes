import { SidebarInset, SidebarProvider, SidebarTrigger } from '@ui/sidebar.ui';

import { Separator } from '@shared/ui/separator.ui';

// import {
//     Breadcrumb,
//     BreadcrumbLink,
//     BreadcrumbItem,
//     BreadcrumbList,
//     BreadcrumbSeparator,
//     BreadcrumbPage,
// } from '@shared/ui/breadcrumb.ui';

import { AppSidebar } from '@shared/components/app-sidebar.component';
import { SupportDropdown } from '@src/contact-center/components';
import { UserAccountDropdown } from '@src/stripe/components';
import { Route } from '@routes/__root';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const {
        auth: { logOut },
    } = Route.useRouteContext();

    return (
        <div className="flex max-h-screen min-h-screen flex-col bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100">
            {/* Very subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {/* Subtle geometric shapes - following guidelines for very minimal decoration */}
                <div
                    className="absolute left-10 top-20 hidden h-8 w-8 rounded-full border-2 border-blue-200 opacity-30 sm:block"
                    style={{ transform: 'rotate(0.1deg)' }}
                ></div>
                <div
                    className="absolute bottom-32 right-16 hidden h-6 w-6 border border-green-200 opacity-40 sm:block"
                    style={{ borderRadius: '15% 85% 20% 80%' }}
                ></div>
                <div className="absolute bottom-20 left-1/4 hidden h-2 w-2 rounded-full bg-orange-200 opacity-50 sm:block"></div>
            </div>

            <SidebarProvider className="w-full overflow-hidden">
                <AppSidebar />

                <SidebarInset className="flex min-h-0 flex-col overflow-hidden">
                    {/* Clean, functional header with thick primary border */}
                    <header className="border-primary border-b-4 bg-white/80 backdrop-blur-sm">
                        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                            <SidebarTrigger
                                className="hand-drawn-button -ml-1 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg"
                                style={{
                                    borderRadius: '12px 14px 12px 16px',
                                }}
                            />

                            <Separator
                                orientation="vertical"
                                className="mr-2 border-blue-200 data-[orientation=vertical]:h-4"
                            />

                            {/* <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#" className="text-hand-drawn-body text-blue-600">
                                            PraxisNotes
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>

                                    <BreadcrumbSeparator className="hidden md:block" />

                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-hand-drawn-body">Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb> */}

                            <div className="ml-auto flex items-center gap-2">
                                <SupportDropdown />
                                <UserAccountDropdown
                                    onLogOut={() => void logOut()}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Main content area with hand-drawn styling */}
                    <main
                        className="relative m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-3xl border-2 border-blue-200 bg-white p-0 shadow-lg"
                        style={{
                            borderRadius: '25px 30px 20px 35px',
                        }}
                    >
                        {/* Thumb tack for main content */}
                        <div className="absolute -top-2 right-8 h-3 w-3 rotate-45 transform bg-green-400 shadow-sm"></div>

                        <div className="h-full min-h-0 overflow-hidden">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
