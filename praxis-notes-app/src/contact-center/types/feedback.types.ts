export type FeedbackType = 'suggestion' | 'bug';

export type FeedbackDialogProps = {
    trigger?: React.ReactNode;
    initialType?: FeedbackType;
};
