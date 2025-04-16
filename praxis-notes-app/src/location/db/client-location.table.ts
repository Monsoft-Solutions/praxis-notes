import { relations } from 'drizzle-orm';

import { char, table, bigint } from '@db/sql';

import { clientTable } from '@db/db.tables';
import { locationTable } from './location.table';

/**
 * client_location - junction table for client/location relationship
 */
export const clientLocationTable = table('client_location', {
    id: char('id', { length: 36 }).primaryKey(),

    // client this location is associated with
    clientId: char('client_id', { length: 36 })
        .references(() => clientTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    // location associated with the client
    locationId: char('location_id', { length: 36 })
        .references(() => locationTable.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    // when this association was created
    createdAt: bigint('created_at', {
        mode: 'number',
    }).notNull(),
});

export const clientLocationTableRelations = relations(
    clientLocationTable,
    ({ one }) => ({
        client: one(clientTable, {
            fields: [clientLocationTable.clientId],
            references: [clientTable.id],
        }),
        location: one(locationTable, {
            fields: [clientLocationTable.locationId],
            references: [locationTable.id],
        }),
    }),
);
