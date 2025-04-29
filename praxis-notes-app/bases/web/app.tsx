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

            // Skip tracking for non-interactive or utility elements
            const targetElement = event.target as HTMLElement;
            if (
                targetElement.tagName === 'SVG' ||
                targetElement.tagName === 'PATH' ||
                targetElement.closest('.no-analytics')
            ) {
                return;
            }

            let targetText = 'unknown';
            // Get more meaningful information about the clicked element
            targetText = targetElement.textContent?.trim() ?? 'unknown';
            // Use data attributes for more specific tracking when available
            if (targetElement.dataset.trackingLabel) {
                targetText = targetElement.dataset.trackingLabel;
            }

            // Use more descriptive category and action
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            trackEvent('user_interaction', 'element_click', targetText);
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
