import React from 'react';

type ViewContainerProps = {
    children: React.ReactNode;
};

export const ViewContainer: React.FC<ViewContainerProps> = ({ children }) => {
    return (
        <div className="container mx-auto space-y-6 px-0 py-6">{children}</div>
    );
};
