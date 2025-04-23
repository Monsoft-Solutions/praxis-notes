import ReactGA from 'react-ga4';
import { z } from 'zod';

const GA_MEASUREMENT_ID = z
    .string()
    .min(1)
    .parse(import.meta.env.MSS_CLIENT_GOOGLE_ANALYTICS_ID);

let initialized = false;

/**
 * Initializes Google Analytics 4.
 * Should be called once when the application starts.
 */
export const initializeGA = () => {
    if (initialized || !GA_MEASUREMENT_ID) {
        console.warn(
            'GA already initialized or Measurement ID not found in environment variables (VITE_GA_MEASUREMENT_ID).',
        );
        return;
    }
    ReactGA.initialize(GA_MEASUREMENT_ID, {
        // Optional configuration
        // testMode: import.meta.env.DEV,
    });

    initialized = true;
    // Track initial page view
    trackPageView(window.location.pathname + window.location.search);

    console.debug('GA Initialized with Measurement ID:', GA_MEASUREMENT_ID);
};

/**
 * Tracks a page view event.
 * @param path - The path of the page viewed (e.g., /home)
 */
export const trackPageView = (path: string) => {
    if (!initialized) return;
    ReactGA.send({ hitType: 'pageview', page: path });
    console.debug(`GA PageView tracked: ${path}`);
};

/**
 * Tracks a custom event.
 * @param category - The category of the event (e.g., 'User')
 * @param action - The action performed (e.g., 'Login')
 * @param label - An optional label for the event
 */
export const trackEvent = (
    category: string,
    action: string,
    label?: string,
) => {
    if (!initialized) return;
    ReactGA.event({
        category,
        action,
        label,
    });
    console.debug(
        `GA Event tracked: ${category} - ${action}${label ? ` - ${label}` : ''}`,
    );
};

/**
 * Tracks a user login event.
 */
export const trackLogin = () => {
    trackEvent('Authentication', 'Login');
};

/**
 * Tracks a user sign-up event.
 */
export const trackSignUp = () => {
    trackEvent('Authentication', 'SignUp');
};

// Page view tracking will be handled using TanStack Router events
// where the router instance is available.
