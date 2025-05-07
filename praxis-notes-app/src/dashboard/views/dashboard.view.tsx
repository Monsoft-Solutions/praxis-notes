import React from 'react';
import { ClientsOverview } from '../components';
import { SupportCard } from '@src/contact-center/components';
import { ViewContainer } from '@shared/ui';

export const DashboardView: React.FC = () => {
    return (
        <ViewContainer>
            <ClientsOverview />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SupportCard />
                {/* Additional dashboard sections can be added here */}
            </div>
        </ViewContainer>
    );
};
