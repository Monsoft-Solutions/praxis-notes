import { Function } from '@errors/types';
import { Error, Success } from '@errors/utils';

import { streamToString } from '@shared/utils/stream-to-string.util';

import { getAzureContainerClient } from './get-azure-container-client.provider';

export const getAzureBlobContent = (async ({
    blobName,
}: {
    blobName: string;
}) => {
    const { data: containerClient, error: containerClientError } =
        await getAzureContainerClient();

    if (containerClientError) return Error();

    // Get block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Download blob
    const downloadResponse = await blockBlobClient.download();

    const { readableStreamBody: stream } = downloadResponse;

    if (!stream) return Error();

    const { data: content } = await streamToString(stream);

    return Success(content);
}) satisfies Function<{ blobName: string }, string>;
