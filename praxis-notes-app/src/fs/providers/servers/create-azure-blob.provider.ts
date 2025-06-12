import { Function } from '@errors/types';
import { Success, Error } from '@errors/utils';
import { catchError } from '@errors/utils/catch-error.util';

import { getAzureContainerClient } from './get-azure-container-client.provider';

export const createAzureBlob = (async ({
    blobName,
    content,
}: {
    blobName: string;
    content: string;
}) => {
    const { data: containerClient, error: containerClientError } =
        await getAzureContainerClient();

    if (containerClientError) return Error();

    const blobClient = containerClient.getBlockBlobClient(blobName);

    const { error: uploadError } = await catchError(
        blobClient.upload(content, content.length),
    );

    if (uploadError) return Error();

    return Success();
}) satisfies Function<{ blobName: string; content: string }>;
