import { Function } from '@errors/types';
import { Success } from '@errors/utils';

import { appUrl } from '@dist/constants';

const verifyEmailPath = '/api/auth.verifyEmail';

export const sendVerificationEmail = (({ id }) => {
    const link = `${appUrl}${verifyEmailPath}?input=%7B%22id%22%3A%22${id}%22%7D`;

    // TODO: send email
    console.log(link);

    return Success();
}) satisfies Function<{ id: string }>;
