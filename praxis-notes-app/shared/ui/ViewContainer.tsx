import { cn } from '@css/utils';
import React from 'react';

type ViewContainerProps = {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
};

export const ViewContainer: React.FC<ViewContainerProps> = ({
    children,
    className,
    noPadding = false,
}) => {
    return (
        <div
            className={cn(
                'flex h-full min-h-0 w-full flex-col overflow-hidden',
                'container mx-auto',
                !noPadding && 'space-y-6 p-4',
                noPadding && 'p-0',
                className,
            )}
        >
            {children}
        </div>
    );
};
