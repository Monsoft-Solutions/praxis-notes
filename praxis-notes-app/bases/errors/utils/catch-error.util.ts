// utility to catch errors in promises

import { parseError } from './parse-error.util';
import { throwAsync } from './throw-async.util';

export async function catchError<T>(promise: Promise<T>) {
    return (
        promise
            // if the promise succeeds, return the data, and null error
            .then((data) => ({ data, error: null }) as { data: T; error: null })
            // otherwise, return null data, and the error
            .catch((rawError: unknown) => {
                const parsedError = parseError(rawError);

                console.error(rawError);

                throwAsync(parsedError.code);

                return { data: null, error: parsedError.code } as const;
            })
    );
}
