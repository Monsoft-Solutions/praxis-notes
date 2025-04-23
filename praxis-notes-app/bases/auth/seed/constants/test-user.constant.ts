import { InferInsertModel } from 'drizzle-orm';

import { userTable } from '@db/db.tables';

import { testOrganization } from './test-organization.constant';

export const testUser: InferInsertModel<typeof userTable> = {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    organizationId: testOrganization.id,
};
