import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';

import { getCoreConf } from '@conf/providers/server';
import { logger } from '@logger/providers/logger.provider';

import axios from 'axios';

type MailerLiteField = {
    name?: string;
    last_name?: string;
    tags?: string[];
    [key: string]: string | string[] | undefined;
};

type MailerLiteSubscriber = {
    email: string;
    fields?: MailerLiteField;
};

/**
 * Add a subscriber to MailerLite
 */
export const addSubscriberToMailerLite = (async (
    subscriber: MailerLiteSubscriber,
) => {
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { mailerLiteApiKey } = coreConf;

    try {
        const axiosRequestBody = {
            email: subscriber.email,
            fields: subscriber.fields,
        };

        const response = await axios.post(
            'https://connect.mailerlite.com/api/subscribers',
            axiosRequestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${mailerLiteApiKey}`,
                },
            },
        );

        if (response.status >= 400) {
            const errorData = response.data as Record<string, unknown>;
            logger.error('Failed to add subscriber to MailerLite', {
                status: response.status,
                error: errorData,
                subscriber,
            });
            return Error('MAILERLITE_API_ERROR');
        }

        logger.info('Subscriber added to MailerLite', {
            email: subscriber.email,
        });

        return Success();
    } catch (error) {
        logger.error('Error adding subscriber to MailerLite', {
            error,
            subscriber,
        });
        return Error('MAILERLITE_API_ERROR');
    }
}) satisfies Function<MailerLiteSubscriber>;

/**
 * Add a subscriber to MailerLite welcome campaign
 */
export const addSubscriberToWelcomeCampaign = (async ({
    email,
    name,
}: {
    email: string;
    name: string;
}) => {
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { mailerLiteWelcomeGroupId } = coreConf;

    return addSubscriberToGroup({
        email,
        name: name,
        groupId: mailerLiteWelcomeGroupId,
        fields: {
            // Add a tag to identify the welcome campaign
            tags: ['welcome_campaign'],
        },
    });
}) satisfies Function<{
    email: string;
    name: string;
    lastName?: string;
}>;

/**
 * Add a subscriber to a specific MailerLite group
 */
export const addSubscriberToGroup = (async ({
    groupId,
    email,
    name,
    fields = {},
}: {
    groupId: string | number;
    email: string;
    name: string;
    fields?: Record<string, string | string[]>;
}) => {
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { mailerLiteApiKey } = coreConf;

    try {
        const axiosRequestBody = {
            email,
            ...(name && { name }),
            ...fields,
        };

        const response = await axios.post(
            `https://api.mailerlite.com/api/v2/groups/${groupId}/subscribers`,
            axiosRequestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-MailerLite-ApiKey': mailerLiteApiKey,
                },
            },
        );

        if (response.status >= 400) {
            const errorData = response.data as Record<string, unknown>;
            logger.error('Failed to add subscriber to MailerLite group', {
                status: response.status,
                error: errorData,
                groupId,
                email,
            });
            return Error('MAILERLITE_GROUP_API_ERROR');
        }

        logger.info('Subscriber added to MailerLite group', {
            email,
            groupId,
        });

        return Success();
    } catch (error) {
        logger.error('Error adding subscriber to MailerLite group', {
            error,
            groupId,
            email,
        });
        return Error('MAILERLITE_GROUP_API_ERROR');
    }
}) satisfies Function<{
    groupId: string | number;
    email: string;
    name: string;
    fields?: Record<string, string | string[]>;
}>;
