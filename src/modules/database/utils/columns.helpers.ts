import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

export const timestampForCreateOnly = {
  createdAt: timestamp('created_at', { precision: 6, withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
};

export const timestampsForUpdate = {
  ...timestampForCreateOnly,
  updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
    .notNull(),
};

export const timestampsForSoftDelete = {
  ...timestampsForUpdate,
  deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true }),
};
