# Error Handling Improvements Implementation Plan

## 1. Feature Overview

The goal is to enhance the error handling system to provide better error visualization in production environments and improve error information for non-database errors. We'll implement a centralized logging mechanism using Winston while keeping the error handling architecture simple and maintainable.

### User Stories

- As a developer, I want to see detailed error logs in production environments to troubleshoot issues efficiently.
- As a user, I want to see appropriate error messages without technical details that help me understand what went wrong.
- As an administrator, I want to receive notifications for critical errors in the system.

## 2. Architecture Overview

The enhanced error handling system will build upon the existing architecture with the following additions:

- A centralized logger service using Winston
- Simplified error classification by error types
- Structured error output format for better readability and analysis
- Integration with the existing error handling utilities

```
┌───────────────────┐     ┌────────────────┐
│ Application Code  │────▶│  Error Handler │────┐
└───────────────────┘     └────────────────┘    │
                                                ▼
                                        ┌────────────────┐
                                        │ Winston Logger │
                                        └────────────────┘
                                                │
                                                ▼
                                ┌─────────────────────────────────┐
                                │ Log Storage / Monitoring System │
                                └─────────────────────────────────┘
```

## 3. Key Components and Modules

### Logger Service

- A new Winston-based logger service that handles structured logging
- Configurable log levels (error, warn, info, debug)
- Multiple transport options (console, file, external services)
- Context enrichment for better error tracing

### Simplified Error Classification

- Basic error type detection based on instance checks
- Standard error formatting for consistent logging
- Environment-specific error detail handling

### Error Integration Module

- Improved `catchError` utility to work with the new logger
- Consistent error handling patterns across the application
- Hooks for error reporting and monitoring systems

## 4. Database Changes

No database changes are required for this feature.

## 5. Implementation Details

### Logger Service Implementation

We'll implement a Winston-based logger service that will be the central point for all error logging:

```typescript
// bases/logger/logger.service.ts
import winston from 'winston';
import { environment } from '@env/environment';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: environment.isDevelopment ? 'debug' : 'info',
    levels,
    format,
    defaultMeta: { service: 'praxis-notes' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
        // Add additional transports as needed (file, external services, etc.)
    ],
});
```

### Enhanced Error Types

We'll maintain a simple error type definition:

```typescript
// bases/errors/schemas/error.schema.ts
export type ErrorCode =
    // Database errors
    | 'DB_CONNECTION'
    | 'SQL_PARSING'
    | 'SQL_UNKNOWN_DB'
    | 'DUPLICATE_ENTRY'
    // General application errors
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_SERVER_ERROR'
    | 'NOT_FOUND'
    | 'BAD_REQUEST';

export interface ErrorType {
    code: ErrorCode;
    message?: string;
    source?: string;
}
```

### Simplified Error Handling

Instead of creating multiple error parsers, we'll use a simplified approach:

```typescript
// bases/errors/utils/parse-error.util.ts
import { ErrorType } from '@errors/schemas/error.schema';
import { dbErrorParse } from '@db/errors/db.error';
import { defaultErrorCode } from '@errors/constants';

export const parseError = ((error: unknown) => {
    // First try the existing database error parser
    const dbError = dbErrorParse(error);
    if (dbError) return dbError;

    // Handle standard Error objects
    if (error instanceof Error) {
        return {
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            source: error.stack ? error.stack.split('\n')[0] : 'unknown',
        };
    }

    // Unknown errors
    const unknownError = {
        code: defaultErrorCode,
        message: typeof error === 'string' ? error : JSON.stringify(error),
        source: 'unknown',
    } as const;

    return unknownError;
}) satisfies (error: unknown) => ErrorType;
```

### Updated catchError Utility

```typescript
// bases/errors/utils/catch-error.util.ts
import { parseError } from './parse-error.util';
import { throwAsync } from './throw-async.util';
import { logger } from '@logger/logger.service';

export async function catchError<T>(promise: Promise<T>) {
    return (
        promise
            // if the promise succeeds, return the data, and null error
            .then((data) => ({ data, error: null }) as { data: T; error: null })
            // otherwise, return null data, and the error
            .catch((rawError: unknown) => {
                const parsedError = parseError(rawError);

                // Log the error with all available details
                logger.error('Error caught', {
                    errorCode: parsedError.code,
                    errorMessage: parsedError.message,
                    errorSource: parsedError.source,
                    rawError: environment.isDevelopment ? rawError : undefined,
                });

                throwAsync(parsedError.code);

                return { data: null, error: parsedError.code } as const;
            })
    );
}
```

## 6. Implementation Steps

1. **Install Dependencies** (Complexity: Low)

    - Add Winston and related packages
    - Configure package.json with the new dependencies

2. **Create Logger Service** (Complexity: Medium)

    - Implement the Winston-based logger service
    - Configure different logging transports
    - Create utility functions for logging with context

3. **Update Existing Error Utilities** (Complexity: Medium)

    - Modify catchError to use the new logger
    - Update parseError to include basic error classification
    - Ensure proper environment variable handling for dev/prod differences

4. **Create Error Monitoring Integration** (Complexity: Medium)

    - Add hooks for external error monitoring services
    - Implement environment-specific error detail filtering
    - Create user-friendly error messages for production

5. **Update Documentation** (Complexity: Low)
    - Document the new error handling architecture
    - Create usage examples for developers
    - Update API docs with error response formats

## 7. New Modules Guidelines

The implementation will follow the existing project architecture and coding standards. The new logger module will be created in the bases directory to make it available across the application.

Structure:

```
praxis-notes-app/
├── bases/
│   ├── logger/
│   │   ├── logger.service.ts
│   │   ├── logger.types.ts
│   │   └── index.ts
│   ├── errors/
│   │   ├── schemas/
│   │   │   └── error.schema.ts (updated)
│   │   ├── utils/
│   │   │   ├── catch-error.util.ts (updated)
│   │   │   ├── parse-error.util.ts (updated)
│   │   │   └── throw-async.util.ts
```

## 8. Integration and Testing Strategy

### Test Cases

1. Database error handling and logging
2. Standard JavaScript error handling and logging
3. Unknown/unexpected error handling and logging
4. Error logging in development vs. production environments
5. Logger service configuration and transports
6. Error context preservation in logs

## 9. Impact on Existing Architecture

The proposed changes will enhance the existing error handling architecture without disrupting the current functionality. The main impacts are:

- Addition of a new logger module
- Simplified error handling
- Enhanced error logging
- Improved error visibility in production

All changes are backward compatible with the existing code.

## 10. Deployment Strategy

The deployment will be done in phases:

1. **Phase 1**: Deploy the logger service
2. **Phase 2**: Update the error handling utilities to use the logger

Feature flags:

- `ENABLE_ERROR_LOGGING`: Controls the new logging functionality
- `ERROR_LOG_LEVEL`: Configures the logging verbosity

Rollback Strategy:

- Each phase can be independently rolled back if issues are detected
- The original error handling code paths remain intact

## 11. Future Considerations

Potential enhancements for future iterations:

- Integration with error monitoring services like Sentry or New Relic
- Error analytics dashboard for tracking application error trends
- Automated alert system for critical errors
- Custom error handling for specific application features

## 12. Documentation Requirements

### Developer Documentation

- Error handling best practices
- How to use the catchError utility
- Logging standards and conventions

### Operations Documentation

- Configuring the logging system
- Monitoring error logs
- Setting up alerts
- Troubleshooting common errors

### End-User Documentation

- Understanding error messages
- Steps to resolve common issues
- When to contact support
