import { sql } from 'drizzle-orm';
import {
  pgTable,
  bigint,
  varchar,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';

import { timestampsForSoftDelete } from '@/modules/database/utils';

export const majorCategory = pgTable(
  'major_category',
  {
    majorCategoryId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    sortKey: bigint('sort_key', { mode: 'bigint' }).notNull(),
    majorCategoryName: varchar('major_category_name', {
      length: 255,
    }).notNull(),
    isValid: boolean('is_valid').notNull(),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_major_category', columns: [tb.majorCategoryId] }),
    unique('uq_major_category_sort_key').on(tb.sortKey),
    uniqueIndex('uq_active_major_category')
      .on(tb.majorCategoryName)
      .where(sql`${tb.isValid} = TRUE`),
    index('ix_major_category_sort')
      .on(tb.sortKey.asc())
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_major_category_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const minerCategory = pgTable(
  'miner_category',
  {
    minerCategoryId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    majorCategoryId: bigint('major_category_id', { mode: 'bigint' }).notNull(),
    sortKey: bigint('sort_key', { mode: 'bigint' }).notNull(),
    minerCategoryName: varchar('miner_category_name', {
      length: 255,
    }).notNull(),
    isValid: boolean('is_valid').notNull(),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_miner_category', columns: [tb.minerCategoryId] }),
    foreignKey({
      name: 'fk_category',
      columns: [tb.majorCategoryId],
      foreignColumns: [majorCategory.majorCategoryId],
    }),
    unique('uq_miner_category_sort_key').on(tb.majorCategoryId, tb.sortKey),
    uniqueIndex('uq_active_miner_category')
      .on(tb.minerCategoryName)
      .where(sql`${tb.isValid} = TRUE`),
    index('ix_miner_category_sort')
      .on(tb.sortKey.asc())
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_miner_category_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);
