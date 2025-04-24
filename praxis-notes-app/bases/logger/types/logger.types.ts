export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LogContext = Record<string, unknown>;

export type LoggerInterface = {
    error(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
};
