import { LogContext } from '../../logger/types/logger.types';

// util to throw an error asynchronously
export const throwAsync = (name: string, error?: LogContext) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        // Lazy import logger only on server side
        void import('../../logger/providers/logger.provider').then(
            ({ logger }) => {
                logger.error(name, error);
            },
        );
    } else {
        void new Promise(() => {
            throw new Error(name);
        });
    }
};
