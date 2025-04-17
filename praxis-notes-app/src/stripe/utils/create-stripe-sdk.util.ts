import { getCoreConf } from '@conf/providers/server';

import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import Stripe from 'stripe';

export const createStripeSdk = (async () => {
    const coreConfWithError = await getCoreConf();

    const { error: coreConfError } = coreConfWithError;

    if (coreConfError !== null) return Error('MISSING_CORE_CONF');

    const { data: coreConf } = coreConfWithError;

    const { stripeSecretKey } = coreConf;

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-03-31.basil',
        typescript: true,
    });

    return Success(stripe);
}) satisfies Function<void, typeof Stripe.prototype>;
