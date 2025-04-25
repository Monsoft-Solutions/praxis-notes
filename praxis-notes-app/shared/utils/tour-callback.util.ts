import { CallBackProps } from 'react-joyride';

import { TourStepId } from '@shared/types/tour-step-id.type';

import { wait } from './wait.util';

export const tourCallback = ({
    data,
    setStepIndex,
}: {
    data: CallBackProps;
    setStepIndex: (stepIndex: number) => void;
}) => {
    void (async () => {
        const { index, action, type, step } = data;

        const id = `#${JSON.stringify(step.target)}` as TourStepId;

        if (action === 'next' && type === 'step:after') {
            switch (id) {
                // TODO: Implement steps logic

                default:
                    break;
            }

            await wait(100);

            setStepIndex(index + 1);
        }
    })();
};
