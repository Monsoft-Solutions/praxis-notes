import { LogContext } from '../../logger/logger.types';

// util to throw an error asynchronously
export const throwAsync = (name: string, error?: LogContext) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        // Lazy import logger only on server side
        void import('../../logger/logger.service').then(({ logger }) => {
            logger.error(name, error);
        });
    } else {
        void new Promise(() => {
            throw new Error(name);
        });
    }
};
