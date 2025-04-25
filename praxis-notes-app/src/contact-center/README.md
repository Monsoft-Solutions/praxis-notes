# Contact Center Module

The Contact Center module provides functionality for handling user feedback, bug reports, and support messages within the PraxisNotes application.

## Features

### Feedback Management

-   Users can submit suggestions and feedback through the Feedback Dialog
-   Feedback is categorized (feature request, improvement, UX, etc.)
-   Admin users can view and manage all feedback

### Bug Reporting

-   Users can report bugs with detailed information
-   Bug reports include title, description, severity, app area, and optional screenshots
-   Admin users can track and manage bug reports

### Support Messages

-   Both authenticated and anonymous users can submit support messages
-   Messages include contact information for follow-up
-   Admin users can view and respond to support messages

## API Endpoints

### Queries

-   `getFeedbacks` - Retrieve feedback entries with pagination
-   `getBugReports` - Retrieve bug reports with pagination
-   `getSupportMessages` - Retrieve support messages with pagination

### Mutations

-   `submitFeedback` - Submit user feedback/suggestions
-   `submitBugReport` - Submit a bug report
-   `submitSupportMessage` - Submit a support message (authenticated user)
-   `submitAnonymousSupport` - Submit a support message (anonymous)

## Database Models

### Feedback

-   Stores user suggestions and feedback
-   Includes type, content, and status tracking

### Bug Reports

-   Stores bug reports with detailed information
-   Includes severity, app area, and steps to reproduce

### Support Messages

-   Stores support requests and messages
-   Includes contact information for follow-up

## Future Enhancements

-   Add email notifications for new messages/reports
-   Implement a dashboard for support staff
-   Add the ability to track issue resolution and follow-up
-   Create a knowledge base integration for common issues
-   Add real-time chat support for immediate assistance
