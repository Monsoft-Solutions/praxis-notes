import Clarity from '@microsoft/clarity';
import { z } from 'zod';

// Ensure you have this environment variable set, e.g., in your .env file
const CLARITY_PROJECT_ID = z
    .string()
    .min(1, 'Missing Microsoft Clarity Project ID (MSS_CLIENT_CLARITY_ID)')
    .parse(import.meta.env.MSS_CLIENT_CLARITY_PROJECT_ID);

let initialized = false;

/**
 * Initializes Microsoft Clarity.
 * Should be called once when the application starts.
 */
export const initializeClarity = () => {
    if (initialized) {
        console.warn('Clarity already initialized.');
        return;
    }
    if (!CLARITY_PROJECT_ID) {
        console.error(
            'Clarity Project ID not found in environment variables (MSS_CLIENT_CLARITY_ID). Clarity will not be initialized.',
        );
        return;
    }
    try {
        Clarity.init(CLARITY_PROJECT_ID);
        initialized = true;
        console.log('Clarity Initialized with Project ID:', CLARITY_PROJECT_ID);

        // Clarity automatically tracks page views after initialization.
    } catch (error) {
        console.error('Failed to initialize Clarity:', error);
    }
};

/**
 * Identifies the user in Clarity.
 * @param userId - The unique identifier for the user.
 * @param sessionId - Optional custom session identifier.
 * @param pageId - Optional custom page identifier.
 * @param friendlyName - Optional friendly name for the user.
 */
export const identifyUserClarity = (
    userId: string,
    sessionId?: string,
    pageId?: string,
    friendlyName?: string,
) => {
    if (!initialized) return;
    try {
        Clarity.identify(userId, sessionId, pageId, friendlyName);
        console.debug(`Clarity User identified: ${userId}`);
    } catch (error) {
        console.error('Clarity identify error:', error);
    }
};

/**
 * Tracks a custom event in Clarity.
 * @param eventName - The name of the event.
 */
export const trackEventClarity = (eventName: string) => {
    if (!initialized) return;
    try {
        Clarity.event(eventName);
        console.debug(`Clarity Event tracked: ${eventName}`);
    } catch (error) {
        console.error('Clarity event error:', error);
    }
};

/**
 * Sets a custom tag in Clarity.
 * @param key - The key for the tag.
 * @param value - The value(s) for the tag.
 */
export const setTagClarity = (key: string, value: string | string[]) => {
    if (!initialized) return;
    try {
        Clarity.setTag(key, value);
        // Format value for logging if it's an array
        const valueString = Array.isArray(value) ? value.join(', ') : value;
        console.debug(`Clarity Tag set: ${key} = ${valueString}`);
    } catch (error) {
        console.error('Clarity setTag error:', error);
    }
};

/**
 * Manages cookie consent for Clarity tracking.
 * Call this after obtaining user consent.
 * @param consent - Boolean indicating if consent is given (default: true).
 */
export const consentClarity = (consent = true) => {
    if (!initialized) return;
    try {
        Clarity.consent(consent);
        console.debug(`Clarity Consent set: ${consent}`);
    } catch (error) {
        console.error('Clarity consent error:', error);
    }
};

/**
 * Upgrades the session recording priority in Clarity.
 * @param reason - The reason for upgrading the session.
 */
export const upgradeSessionClarity = (reason: string) => {
    if (!initialized) return;
    try {
        Clarity.upgrade(reason);
        console.debug(`Clarity Session upgraded: ${reason}`);
    } catch (error) {
        console.error('Clarity upgrade error:', error);
    }
};
