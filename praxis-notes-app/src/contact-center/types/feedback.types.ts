import type { ReactNode } from 'react';

export type FeedbackDialogType = 'suggestion' | 'bug';

export type FeedbackDialogProps = {
    trigger?: ReactNode;
    initialType?: FeedbackDialogType;
};
