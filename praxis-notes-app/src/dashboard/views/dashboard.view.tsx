import React from 'react';
import { ClientsOverview } from '../components';

export const DashboardView: React.FC = () => {
    return (
        <div className="container mx-auto space-y-6 p-6">
            <ClientsOverview />

            {/* Additional dashboard sections can be added here */}
        </div>
    );
};
