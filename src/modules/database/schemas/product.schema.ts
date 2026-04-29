import { sql } from 'drizzle-orm';
import {
  pgSchema,
  bigint,
  varchar,
  text,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';

import {
  timestampForCreateOnly,
  timestampsForSoftDelete,
} from '@/modules/database/utils';
import { majorCategory, minerCategory } from './public.schema';

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
    optionType: optionTypeEnum().notNull(),
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
    detailOptionId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    optionId: bigint('option_id', { mode: 'bigint' }).notNull(),
    detailOptionName: varchar('detail_option_name', {
      length: 255,
    }).notNull(),
    optionValue: bigint('option_value', { mode: 'bigint' }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_detail_option', columns: [tb.detailOptionId] }),
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
      .on(tb.optionId, tb.detailOptionName)
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

export const product = productSchema.table(
  'product',
  {
    productId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    minerCategoryId: bigint('miner_category_id', { mode: 'bigint' }).notNull(),
    productName: varchar('product_name', {
      length: 255,
    }).notNull(),
    productComments: text().notNull(),
    price: bigint('price', { mode: 'bigint' }).notNull(),
    discountedRate: bigint('discounted_rate', { mode: 'bigint' }).notNull(),
    isRecommended: boolean('is_recommended').notNull().default(false),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_product', columns: [tb.productId] }),
    foreignKey({
      name: 'fk_product_category',
      columns: [tb.minerCategoryId],
      foreignColumns: [minerCategory.minerCategoryId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_active_product')
      .on(
        tb.isRecommended.desc(),
        tb.minerCategoryId,
        tb.createdAt.desc(),
        tb.price,
      )
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_product_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const productImage = productSchema.table(
  'product_image',
  {
    productImageId: bigint('id', { mode: 'bigint' }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 255 }).notNull(),
    fileSize: bigint('file_size', { mode: 'bigint' }).notNull(),
    ...timestampForCreateOnly,
  },
  (tb) => [
    primaryKey({ name: 'pk_product_image', columns: [tb.productImageId] }),
    foreignKey({
      name: 'fk_product_image',
      columns: [tb.productImageId],
      foreignColumns: [product.productId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_file_name').on(tb.fileName),
  ],
);
