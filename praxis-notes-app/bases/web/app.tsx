import { ReactElement, useEffect } from 'react';

import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from '@shared/ui/toaster.ui';

import { api, apiClient, webQueryClient } from '@api/providers/web';

import { router } from './router';

import '../../app/css/styles.css';

import { trackEvent } from '@analytics/providers';

// web app root component
export function App(): ReactElement {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            // You can add more details here, e.g., event.clientX, event.clientY

            const targetElement = event.target;
            let targetText = 'unknown';
            if (targetElement instanceof HTMLElement) {
                targetText = targetElement.textContent?.trim() ?? 'unknown';
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            trackEvent('click', 'click', targetText);
        };

        // Add event listener when the component mounts
        document.addEventListener('click', handleClick);

        // Remove event listener when the component unmounts
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <>
            {/* api provider */}
            <api.Provider client={apiClient} queryClient={webQueryClient}>
                {/* query client provider */}
                <QueryClientProvider client={webQueryClient}>
                    {/* router provider */}
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </api.Provider>

            {/* toaster */}
            <Toaster position="top-center" />
        </>
    );
}
