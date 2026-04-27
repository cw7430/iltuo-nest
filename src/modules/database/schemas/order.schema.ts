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
  check,
} from 'drizzle-orm/pg-core';

import {
  timestampForCreateOnly,
  timestampsForUpdate,
  timestampsForSoftDelete,
} from '@/modules/database/utils';
import { user } from './user.schema';
import { product, detailOption } from './product.schema';

export const orderSchema = pgSchema('order');

export const cart = orderSchema.table(
  'cart',
  {
    cartId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    productId: bigint('product_id', { mode: 'bigint' }).notNull(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    quantity: bigint('quantity', { mode: 'bigint' }).notNull(),
    ...timestampForCreateOnly,
  },
  (tb) => [
    primaryKey({ name: 'pk_cart', columns: [tb.cartId] }),
    foreignKey({
      name: 'fk_cart_product',
      columns: [tb.productId],
      foreignColumns: [product.productId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'fk_cart_user',
      columns: [tb.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_active_cart').on(tb.userId, tb.createdAt, tb.productId),
  ],
);

export const cartOption = orderSchema.table(
  'cart_option',
  {
    cartOptionId: bigint('id', { mode: 'bigint' }).notNull(),
    cartId: bigint('cart_id', { mode: 'bigint' }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_cart_option', columns: [tb.cartOptionId] }),
    foreignKey({
      name: 'fk_cart_detail_option',
      columns: [tb.cartOptionId],
      foreignColumns: [detailOption.detailOptionId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'fk_cart_option',
      columns: [tb.cartId],
      foreignColumns: [cart.cartId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_cart_id').on(tb.cartId),
  ],
);

export const paymentMethod = orderSchema.table(
  'payment_method',
  {
    paymentMethodId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    paymentMethodName: varchar('payment_method_name', {
      length: 255,
    }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_payment_method', columns: [tb.paymentMethodId] }),
    unique('uq_payment_method_name').on(tb.paymentMethodName),
    index('ix_active_payment_method_created_at')
      .on(tb.createdAt.desc())
      .where(sql`${tb.isValid} = TRUE`),
    index('ix_delete_payment_method_deleted_at')
      .on(tb.deletedAt.desc())
      .where(sql`${tb.isValid} = FALSE`),
    check(
      'ck_payment_method_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const payment = orderSchema.table(
  'payment',
  {
    paymentId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    paymentMethodId: bigint('payment_method_id', { mode: 'bigint' }).notNull(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    productPrice: bigint('product_price', { mode: 'bigint' }).notNull(),
    deliveryPrice: bigint('delivery_price', { mode: 'bigint' }).notNull(),
    ...timestampsForUpdate,
  },
  (tb) => [
    primaryKey({ name: 'pk_payment', columns: [tb.paymentId] }),
    foreignKey({
      name: 'fk_payment_method',
      columns: [tb.paymentMethodId],
      foreignColumns: [paymentMethod.paymentMethodId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'fk_payment_user',
      columns: [tb.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_payment_method').on(tb.paymentMethodId),
  ],
);
