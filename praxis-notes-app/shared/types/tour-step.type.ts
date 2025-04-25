import { Step } from 'react-joyride';

export type TourStep = Omit<Step, 'target'> & {
    id: string;
};
