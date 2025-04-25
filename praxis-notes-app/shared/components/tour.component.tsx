import { useState } from 'react';

import Joyride from 'react-joyride';

import { tourCallback } from '@shared/utils/tour-callback.util';

import { tourSteps } from '@shared/constants/tour-steps.constant';

import { Route } from '@routes/_private/_app/route';

export function Tour() {
    const { loggedInUser } = Route.useRouteContext();

    const [stepIndex, setStepIndex] = useState(15);

    if (loggedInUser.hasDoneTour) return null;

    return (
        <Joyride
            steps={tourSteps.map(({ id, ...rest }) => ({
                target: `#${id}`,
                ...rest,
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
