import { TourStep } from '@shared/types/tour-step.type';

export const tourSteps = [
    {
        id: 'client-sidebar-item',
        content:
            "This is where you can see and manage your clients. Let's go there!",
        title: 'Clients Page',
    },
] as const satisfies TourStep[];
