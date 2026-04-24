import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/mysql-core';

export const timestampForCreateOnly = {
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
};

export const timestampsForUpdate = {
  ...timestampForCreateOnly,
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
};

export const timestampsForSoftDelete = {
  ...timestampsForUpdate,
  deletedAt: timestamp('deleted_at'),
};
