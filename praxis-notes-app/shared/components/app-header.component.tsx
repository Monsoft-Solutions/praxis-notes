import { ReactElement } from 'react';

import { SidebarTrigger } from '@ui/sidebar.ui';

import { Separator } from '@shared/ui/separator.ui';

import { SupportDropdown } from '@src/contact-center/components';
import { UserAccountDropdown } from '@src/stripe/components';
import { BORDER_RADIUS } from '@shared/constants/design-tokens.constant';

type AppHeaderProps = {
    onLogOut: () => void;
};

// application top header
export function AppHeader({ onLogOut }: AppHeaderProps): ReactElement {
    return (
        <header className="border-primary border-b-4 bg-white/80 backdrop-blur-sm">
            <div className="flex h-16 shrink-0 items-center gap-2 px-4">
                <SidebarTrigger
                    className="hand-drawn-button -ml-1 h-9 w-9 border-2 border-blue-200 bg-blue-50 p-0 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg"
                    style={{
                        borderRadius: BORDER_RADIUS.button.primary,
                    }}
                />

                <Separator
                    orientation="vertical"
                    className="mr-2 border-blue-200 data-[orientation=vertical]:h-4"
                />

                {/* Inspiring message card for RBTs */}
                <div className="flex flex-1 justify-center">
                    <div
                        className="relative hidden transform rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2 shadow-md transition-all duration-200 hover:shadow-lg sm:block"
                        style={{
                            borderRadius: '15px 18px 12px 20px',
                            borderStyle: 'solid',
                        }}
                    >
                        {/* Small decorative dots */}
                        <div className="absolute -right-0.5 top-1 h-1.5 w-1.5 rounded-full bg-green-400"></div>
                        <div className="absolute -left-0.5 bottom-1 h-1 w-1 rounded-full bg-orange-400"></div>

                        <div
                            className="font-quicksand text-center font-semibold text-blue-700"
                            style={{
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                            }}
                        >
                            <span className="text-sm lg:text-base">
                                Making a meaningful difference in every
                                learner&apos;s journey
                            </span>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb placeholder kept intentionally commented for future use */}
                {/* <Breadcrumb> ... </Breadcrumb> */}

                <div className="ml-auto flex items-center gap-2">
                    <SupportDropdown />
                    <UserAccountDropdown onLogOut={onLogOut} />
                </div>
            </div>
        </header>
    );
}
