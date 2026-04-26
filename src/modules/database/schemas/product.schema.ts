import { sql } from 'drizzle-orm';
import {
  pgSchema,
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
import { majorCategory } from './public.schema';

export const productSchema = pgSchema('product');

export const optionTypeEnum = productSchema.enum('option_type', [
  'RATE',
  'ABSOLUTE',
]);

export const option = productSchema.table(
  'option',
  {
    optionId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    majorCategoryId: bigint('major_category_id', { mode: 'bigint' }).notNull(),
    sortKey: bigint('sort_key', { mode: 'bigint' }).notNull(),
    optionName: varchar('option_name', {
      length: 255,
    }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_option', columns: [tb.optionId] }),
    foreignKey({
      name: 'fk_option_category',
      columns: [tb.majorCategoryId],
      foreignColumns: [majorCategory.majorCategoryId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_option_sort_key').on(tb.majorCategoryId, tb.sortKey),
    uniqueIndex('uq_active_option')
      .on(tb.majorCategoryId, tb.optionName)
      .where(sql`${tb.isValid} = TRUE`),
    index('ix_option_sort')
      .on(tb.majorCategoryId, tb.sortKey.asc())
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_option_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const detailOption = productSchema.table(
  'detail_option',
  {
    optionDetailId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    optionId: bigint('option_id', { mode: 'bigint' }).notNull(),
    optionDetailName: varchar('option_detail_name', {
      length: 255,
    }).notNull(),
    optionValue: bigint('option_value', { mode: 'bigint' }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_detail_option', columns: [tb.optionDetailId] }),
    foreignKey({
      name: 'fk_detail_option',
      columns: [tb.optionId],
      foreignColumns: [option.optionId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    uniqueIndex('uq_detail_option_value')
      .on(tb.optionId, tb.optionValue.desc())
      .where(sql`${tb.isValid} = TRUE`),
    uniqueIndex('uq_active_detail_option')
      .on(tb.optionId, tb.optionDetailName)
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_option_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);
