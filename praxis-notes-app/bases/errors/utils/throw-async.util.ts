import { logger } from '../../logger/logger.service';
import { LogContext } from '../../logger/logger.types';

// util to throw an error asynchronously
export const throwAsync = (name: string, error?: LogContext) => {
    logger.error(name, error);
};
