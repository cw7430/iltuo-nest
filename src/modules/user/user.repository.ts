import { Injectable } from '@nestjs/common';
import { sql, eq, ne, and, desc, asc } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class UserRepository {
  async findUserById(conn: DbOrTx, param: { userId: bigint }) {
    const { user } = schema;
    const result = await conn
      .select()
      .from(user)
      .where(and(eq(user.userId, param.userId), ne(user.authRole, 'LEFT')))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findNativeLoginInfoByUserName(
    conn: DbOrTx,
    param: { userName: string },
  ) {
    const { user, nativeUser } = schema;
    const { userId, authType, authRole } = user;
    const { passwordHash } = nativeUser;
    const result = await conn
      .select({
        userId,
        authType,
        passwordHash,
        authRole,
      })
      .from(user)
      .where(
        and(
          eq(user.userName, param.userName),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .innerJoin(nativeUser, eq(user.userId, nativeUser.nativeUserId))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findRefreshInfoByUserId(conn: DbOrTx, param: { userId: bigint }) {
    const { user } = schema;
    const { authType, authRole } = user;
    const result = await conn
      .select({ authType, authRole })
      .from(user)
      .where(and(eq(user.userId, param.userId), ne(user.authRole, 'LEFT')))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findAdressesByUserID(conn: DbOrTx, param: { userId: bigint }) {
    const { address } = schema;

    return conn
      .select()
      .from(address)
      .where(and(eq(address.isValid, true), eq(address.userId, param.userId)))
      .orderBy(desc(address.isMain), asc(address.createdAt));
  }

  async findMainAddressByUserId(conn: DbOrTx, param: { userId: bigint }) {
    const { address } = schema;

    const result = await conn
      .select()
      .from(address)
      .where(and(eq(address.isMain, true), eq(address.userId, param.userId)));

    return result[0] ?? undefined;
  }

  async existsUserByUserName(conn: DbOrTx, param: { userName: string }) {
    const { user } = schema;

    const [row] = await conn
      .select({ exists: sql<boolean>`true` })
      .from(user)
      .where(
        and(
          eq(user.userName, param.userName),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .limit(1);

    return !!row;
  }

  async existsUserByUserIdAndToken(
    conn: DbOrTx,
    param: { userId: bigint; token: string },
  ) {
    const { refreshToken } = schema;

    const [row] = await conn
      .select({ exists: sql<boolean>`true` })
      .from(refreshToken)
      .where(
        and(
          eq(refreshToken.userId, param.userId),
          eq(refreshToken.token, param.token),
        ),
      )
      .limit(1);

    return !!row;
  }

  async existsAddressByUserIdAndIsMain(
    conn: DbOrTx,
    param: { userId: bigint },
  ) {
    const { address } = schema;

    const [row] = await conn
      .select({ exists: sql<boolean>`true` })
      .from(address)
      .where(
        and(
          eq(address.userId, param.userId),
          eq(address.isMain, true),
          eq(address.isValid, true),
        ),
      )
      .limit(1);

    return !!row;
  }

  async createRefreshToken(
    conn: DbOrTx,
    data: { userId: bigint; token: string; expiresAt: Date },
  ) {
    return conn
      .insert(schema.refreshToken)
      .values(data)
      .returning({ refreshTokenId: schema.refreshToken.refreshTokenId });
  }

  async createUser(
    conn: DbOrTx,
    data: {
      userName: string;
      realName: string;
      phoneNumber: string;
      email: string;
      authType: 'NATIVE' | 'SOCIAL' | 'CROSS';
    },
  ) {
    return conn
      .insert(schema.user)
      .values({
        ...data,
        authRole: 'USER',
      })
      .returning({
        userId: schema.user.userId,
        authType: schema.user.authType,
        authRole: schema.user.authRole,
      });
  }

  async createNativeUser(
    conn: DbOrTx,
    data: { nativeUserId: bigint; passwordHash: string },
  ) {
    return conn
      .insert(schema.nativeUser)
      .values(data)
      .returning({ nativeUserId: schema.nativeUser.nativeUserId });
  }

  async createAddress(
    conn: DbOrTx,
    data: {
      userId: bigint;
      postalCode: string;
      defaultAddress: string;
      detailAddress: string | null;
      extraAddress: string | null;
      isMain: boolean;
    },
  ) {
    return conn.insert(schema.address).values(data).returning({
      addressId: schema.address.addressId,
      userId: schema.address.userId,
    });
  }

  async updateAddress(
    conn: DbOrTx,
    data: {
      postalCode: string;
      defaultAddress: string;
      detailAddress: string | null;
      extraAddress: string | null;
    },
    param: { addressId: bigint },
  ) {
    return conn
      .update(schema.address)
      .set(data)
      .where(eq(schema.address.addressId, param.addressId))
      .returning({
        addressId: schema.address.addressId,
        userId: schema.address.userId,
      });
  }

  async updateMainAddress(
    conn: DbOrTx,
    data: {
      isMain: boolean;
    },
    param: { addressId: bigint },
  ) {
    return conn
      .update(schema.address)
      .set(data)
      .where(eq(schema.address.addressId, param.addressId))
      .returning({
        addressId: schema.address.addressId,
        userId: schema.address.userId,
      });
  }

  async invalidateAddress(conn: DbOrTx, param: { addressId: bigint }) {
    return conn
      .update(schema.address)
      .set({ isMain: false, isValid: false, deletedAt: new Date() })
      .where(eq(schema.address.addressId, param.addressId))
      .returning({
        addressId: schema.address.addressId,
        userId: schema.address.userId,
      });
  }

  async deleteRefreshTokenByToken(conn: DbOrTx, param: { token: string }) {
    return conn
      .delete(schema.refreshToken)
      .where(eq(schema.refreshToken.token, param.token));
  }
}
