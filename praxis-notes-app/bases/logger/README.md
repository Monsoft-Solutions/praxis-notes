# Logger Service with Slack Integration

This module provides a centralized logging service for the Praxis Notes application with Slack integration for error reporting.

## Features

-   Winston-based logging with multiple transports
-   Environment-aware logging levels (more verbose in development)
-   File logging with rotation
-   Direct Slack integration for error messages
-   Rich error formatting with context and stack traces

## Usage

```typescript
import { logger } from '@bases/logger';

// Basic logging
logger.info('User signed up successfully', { userId: 'user-123' });
logger.debug('Processing request', { requestId: 'req-456' });
logger.warn('Rate limit approaching', { endpoint: '/api/users' });

// Error logging (will be sent to Slack)
logger.error('Payment processing failed', {
    userId: 'user-789',
    orderId: 'order-123',
    amount: 99.99,
});

// Logging with Error object (stack trace will be included in Slack message)
try {
    throw new Error('Database connection failed');
} catch (error) {
    logger.error('Failed to process request', {
        error: error as Error,
        requestId: 'req-456',
    });
}
```

## Configuration

### Slack Integration

The logger sends error messages to a configured Slack webhook.

#### Testing the Slack Integration

Run the test script to verify your Slack integration is working:

```
npx ts-node praxis-notes-app/bases/logger/test-error-logging.ts
```

#### Modifying the Slack Message Format

To customize the format of Slack messages, modify the `_sendToSlack` method in `logger.service.ts`.

## Environment Variables

In your environment configuration (`.env-cmdrc` or environment template files):

```
# Slack integration - for local development
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_ERROR_CHANNEL=#errors
```

## Production Setup

For production environments, make sure to set up a dedicated Slack channel for error reporting and update the webhook URL in your environment variables.
