import { sql } from 'drizzle-orm';
import {
  pgSchema,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  primaryKey,
  foreignKey,
  unique,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';

import { timestampsForSoftDelete } from '@/modules/database/utils';

export const userSchema = pgSchema('user');

export const authTypeEnum = userSchema.enum('auth_type', [
  'NATIVE',
  'SOCIAL',
  'CROSS',
]);

export const authRoleEnum = userSchema.enum('auth_role', [
  'USER',
  'ADMIN',
  'LEFT',
]);

export const user = userSchema.table(
  'user',
  {
    userId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    realName: varchar('real_name', { length: 255 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    email: varchar('email', { length: 255 }),
    authType: authTypeEnum('auth_type').default('NATIVE').notNull(),
    authRole: authRoleEnum('auth_role').default('USER').notNull(),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_user', columns: [tb.userId] }),
    uniqueIndex('uq_user_name')
      .on(tb.userName)
      .where(sql`${tb.authType} <> 'SOCIAL' AND ${tb.authRole} <> 'LEFT'`),
    index('ix_active_user_created_at')
      .on(tb.createdAt.desc())
      .where(sql`${tb.authRole} <> 'LEFT'`),
    index('ix_delete_user_deleted_at')
      .on(tb.deletedAt.desc())
      .where(sql`${tb.authRole} = 'LEFT'`),
    check(
      'ck_user_deleted_state',
      sql`(
          (${tb.authRole} <> 'LEFT' AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.authRole} = 'LEFT' AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const nativeUser = userSchema.table(
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

export const socialProvider = userSchema.table(
  'social_provider',
  {
    providerId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    providerName: varchar('provider_name', { length: 255 }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    ...timestampsForSoftDelete,
  },
  (tb) => [
    primaryKey({ name: 'pk_social_provider', columns: [tb.providerId] }),
    unique('uq_social_provider_name').on(tb.providerName),
    index('ix_active_social_provider_created_at')
      .on(tb.createdAt.desc())
      .where(sql`${tb.isValid} = TRUE`),
    index('ix_delete_social_provider_deleted_at')
      .on(tb.deletedAt.desc())
      .where(sql`${tb.isValid} = FALSE`),
    check(
      'ck_social_provider_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);

export const socialUser = userSchema.table(
  'social_user',
  {
    socialUserId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
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

export const refreshToken = userSchema.table(
  'refresh_token',
  {
    refreshTokenId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', {
      precision: 6,
      withTimezone: true,
    }).notNull(),
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
    index('ix_refresh_token_user').on(tb.userId),
    unique('uq_active_refresh_token').on(tb.token),
    index('ix_refresh_token_expire').on(tb.expiresAt),
  ],
);

export const address = userSchema.table(
  'address',
  {
    addressId: bigint('id', { mode: 'bigint' })
      .notNull()
      .generatedByDefaultAsIdentity(),
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
    uniqueIndex('uq_main_address')
      .on(tb.userId)
      .where(sql`${tb.isMain} = TRUE`),
    index('ix_address_main')
      .on(tb.userId, tb.isMain.desc(), tb.createdAt.asc())
      .where(sql`${tb.isValid} = TRUE`),
    check(
      'ck_address_deleted_state',
      sql`(
          (${tb.isValid} = TRUE AND ${tb.deletedAt} IS NULL)
          OR
          (${tb.isValid} = FALSE AND ${tb.deletedAt} IS NOT NULL)
          )`,
    ),
  ],
);
