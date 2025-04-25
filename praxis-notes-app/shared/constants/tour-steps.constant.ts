import { TourStep } from '@shared/types/tour-step.type';

export const tourSteps = [
    {
        id: 'client-sidebar-item',
        title: 'Clients Page',
        content:
            "This is where you can see and manage your clients. Let's go there!",
    },

    {
        id: 'add-client-button',
        title: 'Add Client',
        content:
            "Let's quickly add a test client. It's just to get started, you can delete it later.",
    },

    {
        id: 'client-form-basic-info-step',
        title: 'Basic Information',
        content: "Let's add some basic information about the client.",
        placement: 'right',
    },

    {
        id: 'client-form-behavior-step',
        title: 'Behavior',
        content: "Let's add some behavior information about the client.",
        placement: 'right',
    },

    {
        id: 'client-form-programs-step',
        title: 'Programs',
        content: "Let's add some programs information about the client.",
        placement: 'right',
    },

    {
        id: 'client-form-interventions-step',
        title: 'Interventions',
        content: "Let's add some interventions information about the client.",
        placement: 'left',
    },

    {
        id: 'client-form-review-step',
        title: 'Review',
        content: "Let's review the client information.",
        placement: 'left',
    },

    {
        id: 'view-sessions-button',
        title: 'Sessions',
        content:
            "Congrats! You've added your first client. Let's now go to the sessions page.",
        placement: 'left',
    },

    {
        id: 'add-session-button',
        title: 'Add Session',
        content: "Let's add a session for the client.",
        placement: 'left',
    },

    {
        id: 'session-form-basic-info',
        title: 'Basic Information',
        content: "Let's add some basic information about the session.",
    },

    {
        id: 'session-form-abc-entry',
        title: 'ABC Entry',
        content: "Let's add an ABC entry for the session.",
    },

    {
        id: 'session-form-replacement-program',
        title: 'ABC Entry',
        content: "Let's add an ABC entry for the session.",
    },

    {
        id: 'session-form-valuation',
        title: 'Valuation',
        content:
            "Let's specify a valuation for the session. This one was fairly good.",
        placement: 'right',
    },

    {
        id: 'session-form-observations',
        title: 'Observations',
        content: "And finally, let's add some observations for the session.",
        placement: 'right',
    },

    {
        id: 'session-generate-notes-button',
        title: 'Generate Notes',
        content:
            "We could now generate the notes for the session. But let's not do that yet, instead...",
    },

    {
        id: 'session-form-draft-button',
        title: 'Draft',
        content:
            "Let's just save the session as a draft for now. We can thengenerate the notes later.",
    },

    {
        id: 'notes-editor-generate-button',
        title: 'Generate Notes',
        content:
            'With all data filled in, we can now generate the notes for the session.',
    },

    {
        id: 'save-notes-button',
        title: 'Save Notes',
        content:
            "Once you have generated your notes, you can of course edit them, and then don't forget to save them",
    },

    {
        id: 'download-notes-button',
        title: 'Download Notes',
        content:
            "You can also download them to keep a local copy. Let's do that.",
    },
] as const satisfies TourStep[];
