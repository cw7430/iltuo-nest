import { sql } from 'drizzle-orm';
import {
  pgSchema,
  bigint,
  varchar,
  text,
  boolean,
  timestamp,
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
import { user } from './user.schema';
import { product, detailOption } from './product.schema';

export const orderSchema = pgSchema('order');

export const paymentStatusEnum = orderSchema.enum('payment_status', [
  'PENDING',
  'COMPLETED',
  'CANCELED',
]);

export const deliveryStatusEnum = orderSchema.enum('delivery_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'CANCELED',
]);

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
    paymentStatus: paymentStatusEnum('payment_status')
      .notNull()
      .default('PENDING'),
    ...timestampsForSoftDelete,
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
    index('ix_pending_payment_created_at')
      .on(tb.createdAt.desc())
      .where(sql`${tb.paymentStatus} = 'PENDING'`),
    index('ix_completed_payment_created_at')
      .on(tb.createdAt.desc())
      .where(sql`${tb.paymentStatus} = 'COMPLETED'`),
    index('ix_cancled_payment_deleted_at')
      .on(tb.deletedAt.desc())
      .where(sql`${tb.paymentStatus} = 'CANCELED'`),
    check(
      'ck_payment_state',
      sql`(
          (${tb.paymentStatus} <> 'CANCELED' AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.paymentStatus} = 'CANCELED' AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const order = orderSchema.table(
  'order',
  {
    orderId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    paymentId: bigint('payment_id', { mode: 'bigint' }).notNull(),
    productName: varchar('product_name', {
      length: 255,
    }).notNull(),
    quantity: bigint('quantity', { mode: 'bigint' }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_order', columns: [tb.orderId] }),
    foreignKey({
      name: 'fk_order_payment',
      columns: [tb.paymentId],
      foreignColumns: [payment.paymentId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    index('ix_order_payment').on(tb.paymentId),
  ],
);

export const orderOption = orderSchema.table(
  'order_option',
  {
    orderOptionId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    orderId: bigint('order_id', { mode: 'bigint' }).notNull(),
    sortKey: bigint('sort_key', { mode: 'bigint' }).notNull(),
    optionName: varchar('option_name', {
      length: 255,
    }).notNull(),
    detailOptionName: varchar('detail_option_name', {
      length: 255,
    }).notNull(),
    optionValue: bigint('option_value', { mode: 'bigint' }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_order_option', columns: [tb.orderOptionId] }),
    foreignKey({
      name: 'fk_order_option',
      columns: [tb.orderId],
      foreignColumns: [order.orderId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_order_option_name').on(
      tb.orderId,
      tb.optionName,
      tb.detailOptionName,
    ),
    uniqueIndex('uq_order_option_sort').on(tb.orderId, tb.sortKey.asc()),
  ],
);

export const delivery = orderSchema.table(
  'delivery',
  {
    deliveryId: bigint('id', { mode: 'bigint' }).notNull(),
    deliveryStatus: deliveryStatusEnum('delivery_status')
      .notNull()
      .default('PENDING'),
    postalCode: varchar('postal_code', { length: 7 }).notNull(),
    defaultAddress: text('default_address').notNull(),
    detailAddress: text('detail_address'),
    extraAddress: text('extra_address'),
    courierCompany: varchar('courier_company'),
    invoiceNumber: varchar('invoice_number'),
    deliveredAt: timestamp('delivered_at', {
      precision: 6,
      withTimezone: true,
    }),
    arrivedAt: timestamp('arrived_at', {
      precision: 6,
      withTimezone: true,
    }),
    cancledAt: timestamp('cancled_at', {
      precision: 6,
      withTimezone: true,
    }),
  },
  (tb) => [
    primaryKey({ name: 'pk_delivery', columns: [tb.deliveryId] }),
    foreignKey({
      name: 'fk_delivery_payment',
      columns: [tb.deliveryId],
      foreignColumns: [payment.paymentId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    check(
      'ck_delivery_state',
      sql`(
          (${tb.deliveryStatus} <> 'CANCELED' AND ${tb.cancledAt} IS NULL)
          OR
          (${tb.deliveryStatus} = 'CANCELED' AND ${tb.cancledAt} IS NOT NULL)
          )`,
    ),
  ],
);
