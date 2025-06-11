import { varchar } from '@db/sql';

// template core configuration
export const azureCoreConf = {
    // azure storage connection string
    azureStorageConnectionString: varchar(
        'azure_storage_connection_string',
    ).notNull(),

    // azure storage container name
    azureStorageContainerName: varchar(
        'azure_storage_container_name',
    ).notNull(),
};
