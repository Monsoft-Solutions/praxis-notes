import React from 'react';
import { ClientsOverview } from '../components';
import { SupportCard } from '@src/contact-center/components';

export const DashboardView: React.FC = () => {
    return (
        <div className="container mx-auto space-y-6 p-6">
            <ClientsOverview />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SupportCard />
                {/* Additional dashboard sections can be added here */}
            </div>
        </div>
    );
};
