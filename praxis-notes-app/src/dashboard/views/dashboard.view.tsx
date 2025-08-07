import React from 'react';
import { ClientsOverview } from '../components';
import { SupportCard } from '@src/contact-center/components';
import { ViewContainer } from '@shared/ui';

export const DashboardView: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
            {/* Very subtle background decorations */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {/* Subtle geometric shapes */}
                <div
                    className="absolute left-10 top-20 hidden h-12 w-12 rounded-full border-2 border-blue-200 opacity-30 sm:block"
                    style={{ transform: 'rotate(0.1deg)' }}
                ></div>

                <div className="absolute bottom-32 right-16 hidden h-8 w-8 rounded border border-green-200 opacity-40 sm:block"></div>

                {/* Small dots */}
                <div className="absolute bottom-20 left-1/4 hidden h-2 w-2 rounded-full bg-orange-200 opacity-50 lg:block"></div>

                <div className="absolute right-1/3 top-1/3 hidden h-3 w-3 rounded border border-yellow-300 opacity-35 lg:block"></div>
            </div>

            <ViewContainer>
                <div className="space-y-8">
                    <ClientsOverview />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SupportCard />
                        {/* Additional dashboard sections can be added here */}
                    </div>
                </div>
            </ViewContainer>
        </div>
    );
};
