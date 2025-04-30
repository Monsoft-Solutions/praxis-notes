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
        content: 'Start by adding some basic information about the client.',
        placement: 'right',
    },

    {
        id: 'client-form-behavior-step',
        title: 'Behavior',
        content: "Then add the client's behavior information.",
        placement: 'right',
    },

    {
        id: 'client-form-programs-step',
        title: 'Programs',
        content: 'As well as the replacement programs used with this client.',
        placement: 'right',
    },

    {
        id: 'client-form-interventions-step',
        title: 'Interventions',
        content: 'Add finally, the relevant interventions.',
        placement: 'left',
    },

    {
        id: 'client-form-review-step',
        title: 'Review',
        content:
            'You can then review all the information and, if everything is correct, save the client.',
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
        content:
            "Of course, it's a new client, so there are no sessions yet. Let's go ahead and add one.",
        placement: 'left',
    },

    {
        id: 'session-form-basic-info',
        title: 'Basic Information',
        content:
            "As when adding a client, we'll start with the basic information of the session: place and time.",
    },

    {
        id: 'session-form-abc-entry',
        title: 'ABC Entry',
        content:
            'Moving on to the main part, we can add as many ABC entries as needed',
    },

    {
        id: 'session-form-replacement-program',
        title: 'Replacement Program',
        content:
            'Similarly, all replacement programs used during the session can be entered here.',
    },

    {
        id: 'session-form-valuation',
        title: 'Valuation',
        content:
            'Then, we set the overall valuation. Let say this one was fairly good.',
        placement: 'right',
    },

    {
        id: 'session-form-observations',
        title: 'Observations',
        content: 'And finally, some general observations can also be included.',
        placement: 'right',
    },

    {
        id: 'session-generate-notes-button',
        title: 'Generate Notes',
        content:
            "We now have all the information needed to generate the notes for the session. But let's not do that yet, instead...",
    },

    {
        id: 'session-form-draft-button',
        title: 'Draft',
        content:
            "Let's just save the session as a draft for now, so we can then generate the notes later.",
    },

    {
        id: 'notes-editor-generate-button',
        title: 'Generate Notes',
        content:
            "Here's our session already saved. Let's now get some AI-generated notes.",
    },

    {
        id: 'save-notes-button',
        title: 'Save Notes',
        content:
            'Once the notes are generated, they can be edited, and then saved.',
    },

    {
        id: 'download-notes-button',
        title: 'Download Notes',
        content:
            "They can also be downloaded to keep a local copy. Let's do that.",
    },
] as const satisfies TourStep[];
