import { useState } from 'react';

import Joyride from 'react-joyride';

import { tourCallback } from '@shared/utils/tour-callback.util';

import { tourSteps } from '@shared/constants/tour-steps.constant';

export function Tour() {
    const [stepIndex, setStepIndex] = useState(0);

    return (
        <Joyride
            steps={tourSteps.map(({ id, title, content }) => ({
                target: `#${id}`,
                title,
                content,
                disableBeacon: true,
            }))}
            stepIndex={stepIndex}
            callback={(data) => {
                tourCallback({
                    data,
                    setStepIndex,
                });
            }}
            continuous
            showSkipButton
            showProgress
            disableOverlayClose
        />
    );
}
