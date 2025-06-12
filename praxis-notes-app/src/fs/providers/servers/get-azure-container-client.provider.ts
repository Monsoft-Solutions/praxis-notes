import { Function } from '@errors/types';

import { Success, Error } from '@errors/utils';

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

import { getCoreConf } from '@conf/providers/server';

export const getAzureContainerClient = (async () => {
    const { data: coreConf, error } = await getCoreConf();

    if (error) return Error();

    const { azureStorageConnectionString, azureStorageContainerName } =
        coreConf;

    //  blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        azureStorageConnectionString,
    );

    // container client
    const containerClient = blobServiceClient.getContainerClient(
        azureStorageContainerName,
    );

    return Success(containerClient);
}) satisfies Function<void, ContainerClient>;
