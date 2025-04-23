import ReactGA from 'react-ga4'; // Import ReactGA for gtag access
import * as gaService from './ga.provider';
import * as clarityService from './clarity.provider';

/**
 * Initializes both Google Analytics and Microsoft Clarity.
 * Call this once when the application starts.
 */
export const initializeAnalytics = () => {
    console.log('Initializing Analytics');

    gaService.initializeGA();
    clarityService.initializeClarity();
};

/**
 * Tracks a page view event in Google Analytics.
 * Clarity tracks page views automatically.
 * @param path - The path of the page viewed (e.g., /home)
 */
export const trackPageView = (path: string) => {
    gaService.trackPageView(path);
    // No specific Clarity call needed here, it tracks automatically
};

/**
 * Tracks a custom event in both GA and Clarity.
 * @param category - The category of the event (e.g., 'User') for GA.
 * @param action - The action performed (e.g., 'Login') for GA.
 * @param label - An optional label for the event for GA.
 */
export const trackEvent = (
    category: string,
    action: string,
    label?: string,
) => {
    // Track in GA
    gaService.trackEvent(category, action, label);

    // Track in Clarity - combine category and action for event name
    const clarityEventName = `${category}: ${action}${label ? ` (${label})` : ''}`;
    clarityService.trackEventClarity(clarityEventName);
};

/**
 * Identifies the user in both GA (by setting userId) and Clarity.
 * @param userId - The unique identifier for the user.
 * @param friendlyName - Optional friendly name for the user (used by Clarity).
 * @param claritySessionId - Optional custom session ID for Clarity.
 * @param clarityPageId - Optional custom page ID for Clarity.
 */
export const identifyUser = (
    userId: string,
    friendlyName?: string, // Clarity specific
    claritySessionId?: string, // Clarity specific
    clarityPageId?: string, // Clarity specific
) => {
    // Set userId for subsequent GA events
    // Check if GA was initialized
    try {
        // Use gtag('set', ...) for user ID in GA4
        ReactGA.gtag('set', { user_id: userId });
        console.debug(`GA User ID set: ${userId}`);
    } catch (error) {
        console.error('GA set user ID error:', error);
    }

    // Identify user in Clarity
    clarityService.identifyUserClarity(
        userId,
        claritySessionId,
        clarityPageId,
        friendlyName,
    );
};

/**
 * Tracks a user login event using the unified trackEvent and identifies the user.
 */
export const trackLogin = (userId: string): void => {
    console.log('Tracking login for user:', userId);
    identifyUser(userId); // Identify the user on login
    trackEvent('auth', 'login');
};

/**
 * Tracks a user sign-up event using the unified trackEvent and identifies the user.
 */
export const trackSignUp = (userId: string, friendlyName?: string) => {
    identifyUser(userId, friendlyName); // Identify the user on sign up
    trackEvent('auth', 'signup');
};

// Re-exporting Clarity specific functions if direct access is needed
export const setTag = clarityService.setTagClarity;
export const consent = clarityService.consentClarity;
export const upgradeSession = clarityService.upgradeSessionClarity;
