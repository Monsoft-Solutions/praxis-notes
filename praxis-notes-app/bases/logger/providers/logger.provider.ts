import winston from 'winston';
import { deploymentEnv } from '@env/constants/deployment-env.constant';
import { LogContext, LoggerInterface } from '@logger/types';
import { slackService } from '@slack/slack.service';
import Sentry, { SentryTransportOptions } from 'winston-transport-sentry-node';
import { getCoreConf } from '@conf/core/providers/server';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

// Determine if in development environment
const isDevelopment = deploymentEnv.MSS_DEPLOYMENT_TYPE === 'local';
const isProduction = deploymentEnv.MSS_DEPLOYMENT_TYPE === 'production';

// Configure log format
const formatConsole = winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize({
        all: true,
    }),
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

    _sentryOptions?: SentryTransportOptions;

    constructor() {
        void this.setSentryOptions();

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

                new winston.transports.Console({
                    format: formatConsole,
                }),

                new Sentry(this._sentryOptions),
            ],
        });

        console.log('LoggerService constructor');
    }

    info(message: string, context?: LogContext): void {
        this._logger.info(message, context);

        // Send info to Slack if needed
        // We use void to ignore the promise
        if (isProduction) {
            void slackService.sendInfoToSlack(message, context);
        }
    }

    debug(message: string, context?: LogContext): void {
        this._logger.debug(message, context);
    }

    error(message: string, context?: LogContext): void {
        // Log to winston
        this._logger.error(message, context);

        // Send to Slack using the slack service
        if (isProduction) {
            void slackService.sendErrorToSlack(message, context);
        }
    }

    warn(message: string, context?: LogContext): void {
        this._logger.warn(message, context);
    }

    /**
     * Set the Sentry options
     *
     * Takes the sentry DSN from the core configuration
     * @returns {Promise<void>}
     */
    private async setSentryOptions() {
        const coreConfWithError = await getCoreConf();

        const { error: coreConfError } = coreConfWithError;

        if (coreConfError !== null) return Error('MISSING_CORE_CONF');

        const { data: coreConf } = coreConfWithError;

        const { sentryDsn } = coreConf;

        this._sentryOptions = {
            sentry: {
                dsn: sentryDsn,
            },
            level: 'error',
        };
    }
}

export const logger = new LoggerService();
