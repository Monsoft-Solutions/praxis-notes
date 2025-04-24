import winston from 'winston';
import { deploymentEnv } from '@env/constants/deployment-env.constant';
import { LogContext } from '../types/logger.types';
import { LoggerInterface } from '../types/logger.types';
import { slackService } from '../../slack/slack.service';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

// Determine if in development environment
const isDevelopment = deploymentEnv.MSS_DEPLOYMENT_TYPE === 'local';

// Configure log format
const formatConsole = winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.prettyPrint({
        colorize: true,
    }),
);

const formatFile = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
);

class LoggerService implements LoggerInterface {
    _logger: winston.Logger;

    constructor() {
        this._logger = winston.createLogger({
            level: isDevelopment ? 'debug' : 'info',
            defaultMeta: { service: 'praxis-notes' },
            levels,
            transports: [
                new winston.transports.File({
                    filename: `${new Date().toISOString().split('T')[0]}-error.log`,
                    level: 'error',
                    format: formatFile,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    dirname: 'logs',
                }),
                new winston.transports.File({
                    filename: `${new Date().toISOString().split('T')[0]}-combined.log`,
                    level: 'info',
                    format: formatFile,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    dirname: 'logs',
                }),
                // Additional transports can be added here as needed
            ],
        });

        if (isDevelopment) {
            this._logger.add(
                new winston.transports.Console({
                    format: formatConsole,
                }),
            );
        }

        console.log('LoggerService constructor');
    }

    info(message: string, context?: LogContext): void {
        this._logger.info(message, context);

        // Send info to Slack if needed
        // We use void to ignore the promise
        void slackService.sendInfoToSlack(message, context);
    }

    debug(message: string, context?: LogContext): void {
        this._logger.debug(message, context);
    }

    error(message: string, context?: LogContext): void {
        // Log to winston
        this._logger.error(message, context);

        // Send to Slack using the slack service
        void slackService.sendErrorToSlack(message, context);
    }

    warn(message: string, context?: LogContext): void {
        this._logger.warn(message, context);
    }
}

export const logger = new LoggerService();
