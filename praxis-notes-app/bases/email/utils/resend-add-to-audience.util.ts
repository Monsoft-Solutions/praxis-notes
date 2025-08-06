import { Resend } from 'resend';

import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';
import { catchError } from '@errors/utils/catch-error.util';
import { logger } from '@logger/providers';

export const addToAudienceResend = (async (props: {
    audienceId?: string;
    email: string;
    firstName: string;
    lastName: string;
}) => {
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { resendApiKey, resendAudienceId } = coreConf;

    const resend = new Resend(resendApiKey);

    const audienceId = props.audienceId ?? resendAudienceId;

    if (!audienceId) return Error('MISSING_AUDIENCE_ID');

    const { error: contactError } = await catchError(
        resend.contacts.create({
            ...props,
            audienceId,
        }),
    );

    if (contactError) return Error();

    logger.info(`User added to Resend audience: ${props.email}`, {
        email: props.email,
        firstName: props.firstName,
        lastName: props.lastName,
    });

    return Success();
}) satisfies Function<{
    audienceId?: string;
    email: string;
    firstName: string;
    lastName: string;
}>;
