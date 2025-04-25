import { endpoints } from '@api/providers/server';

// mutations
import { submitFeedback } from './submit-feedback.mutation';
import { submitBugReport } from './submit-bug-report.mutation';
import { submitSupportMessage } from './submit-support-message.mutation';
import { submitAnonymousSupport } from './submit-anonymous-support.mutation';

// subscriptions
// No subscriptions for now

export const contactCenter = endpoints({
    // mutations
    submitFeedback,
    submitBugReport,
    submitSupportMessage,
    submitAnonymousSupport,

    // subscriptions
    // None at the moment
});
