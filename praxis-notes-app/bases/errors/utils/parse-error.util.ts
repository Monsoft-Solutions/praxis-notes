import { ErrorType } from '@errors/schemas/error.schema';

import { dbErrorParse } from '@db/errors/db.error';

import { defaultErrorCode } from '@errors/constants';

export const parseError = ((error: unknown) => {
    const dbError = dbErrorParse(error);
    if (dbError) return dbError;

    const unknownError = {
        code: defaultErrorCode,
        message: JSON.stringify(error),
    } as const;

    return unknownError;
}) satisfies (error: unknown) => ErrorType;
