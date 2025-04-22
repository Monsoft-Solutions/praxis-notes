import { organizationTable } from '@db/db.tables';

import { InferInsertModel } from 'drizzle-orm';

export const testOrganization: InferInsertModel<typeof organizationTable> = {
    id: 'test-organization-id',
    name: 'Test Organization',
};
