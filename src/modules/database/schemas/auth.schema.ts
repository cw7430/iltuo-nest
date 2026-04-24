import { sql, asc, desc } from 'drizzle-orm';
import {
  mysqlTable,
  bigint,
  varchar,
  text,
  boolean,
  timestamp,
  primaryKey,
  foreignKey,
  index,
  uniqueIndex,
  unique,
  check,
} from 'drizzle-orm/mysql-core';

import { timestampsForSoftDelete } from '@/modules/database/utils';

export const user = mysqlTable(
  'user',
  {
    userId: bigint('id', { mode: 'bigint' }).notNull().autoincrement(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    authType: varchar('auth_type', { length: 10 }).notNull(),
    authRole: varchar('auth_role', { length: 10 }).notNull().default('USER'),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_user', columns: [tb.userId] }),
    uniqueIndex('uq_active_user_name').on(
      sql`
      (
        CASE
          WHEN (${tb.authType} <> 'SOCIAL') AND (${tb.authRole} <> 'LEFT') THEN ${tb.userName}
          ELSE NULL
        END
      )
      `,
    ),
    index('ix_user_created').on(tb.userName, tb.authRole, tb.createdAt),
    index('ix_user_deleted').on(tb.userName, tb.authRole, tb.deletedAt),
    check('ch_auth_type', sql`${tb.authType} IN('NATIVE','SOCIAL','CROSS')`),
    check('ck_auth_role', sql`${tb.authRole} IN('USER','ADMIN','LEFT')`),
  ],
);

export const nativeUser = mysqlTable(
  'native_user',
  {
    nativeUserId: bigint('id', { mode: 'bigint' }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_native_user', columns: [tb.nativeUserId] }),
    foreignKey({
      name: 'fk_native_user',
      columns: [tb.nativeUserId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const socialProvider = mysqlTable(
  'social_provider',
  {
    providerId: bigint('id', { mode: 'bigint' }).notNull().autoincrement(),
    providerName: varchar('provider_name', { length: 255 }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_social_provider', columns: [tb.providerId] }),
    unique('uq_social_provider_name').on(tb.providerName),
  ],
);

export const socialUser = mysqlTable(
  'social_user',
  {
    socialUserId: bigint('id', { mode: 'bigint' }).notNull().autoincrement(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    providerId: bigint('provider_id', { mode: 'bigint' }).notNull(),
    providerUserName: varchar('provider_user_name', { length: 255 }).notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_social_user', columns: [tb.socialUserId] }),
    foreignKey({
      name: 'fk_social_user',
      columns: [tb.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'fk_social_provider',
      columns: [tb.providerId],
      foreignColumns: [socialProvider.providerId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_social_user_provider').on(
      tb.userId,
      tb.providerId,
      tb.providerUserName,
    ),
  ],
);

export const refreshToken = mysqlTable(
  'refresh_token',
  {
    refreshTokenId: bigint('id', { mode: 'bigint' }).notNull().autoincrement(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (tb) => [
    primaryKey({ name: 'pk_refresh_token', columns: [tb.refreshTokenId] }),
    foreignKey({
      name: 'fk_refresh_token_user',
      columns: [tb.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    unique('uq_active_refresh_token').on(tb.token),
    index('ix_refresh_token_expire').on(tb.token, tb.expiresAt),
  ],
);

export const address = mysqlTable(
  'address',
  {
    addressId: bigint('id', { mode: 'bigint' }).notNull().autoincrement(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    postalCode: varchar('postal_code', { length: 7 }).notNull(),
    defaultAddress: text('default_address').notNull(),
    detailAddress: text('detail_address'),
    extraAddress: text('extra_address'),
    isMain: boolean('is_main').notNull().default(false),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_address', columns: [tb.addressId] }),
    foreignKey({
      name: 'fk_address_user',
      columns: [tb.userId],
      foreignColumns: [user.userId],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    uniqueIndex('uq_main_address').on(
      sql`
       (
        CASE
          WHEN ${tb.isMain} = true THEN ${tb.userId}
          ELSE NULL
        END
      )
      `,
    ),
    index('ix_address_main').on(
      tb.userId,
      tb.isValid,
      desc(tb.isMain),
      asc(tb.createdAt),
    ),
  ],
);
