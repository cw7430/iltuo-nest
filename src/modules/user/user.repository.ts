import { Injectable } from '@nestjs/common';
import { sql, eq, ne, and } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class UserRepository {
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

  async existsByUserName(conn: DbOrTx, param: { userName: string }) {
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

  async existsByUserIdAndToken(
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

  async createRefreshToken(
    conn: DbOrTx,
    param: { userId: bigint; token: string; expiresAt: Date },
  ) {
    const { refreshToken } = schema;

    const { userId, token, expiresAt } = param;

    return conn
      .insert(refreshToken)
      .values({ userId, token, expiresAt })
      .returning({ refreshTokenId: refreshToken.refreshTokenId });
  }

  async createUser(
    conn: DbOrTx,
    param: {
      userName: string;
      realName: string;
      phoneNumber: string;
      email: string;
      authType: 'NATIVE' | 'SOCIAL' | 'CROSS';
    },
  ) {
    const { user } = schema;

    const { userName, realName, phoneNumber, email, authType } = param;

    return conn
      .insert(user)
      .values({
        userName,
        realName,
        phoneNumber,
        email,
        authType,
        authRole: 'USER',
      })
      .returning({ userId: user.userId });
  }

  async createNativeUser(
    conn: DbOrTx,
    param: { nativeUserId: bigint; passwordHash: string },
  ) {
    const { nativeUser } = schema;

    const { nativeUserId, passwordHash } = param;

    return conn
      .insert(nativeUser)
      .values({ nativeUserId, passwordHash })
      .returning({ nativeUserId: nativeUser.nativeUserId });
  }

  async deleteRefreshTokenByToken(conn: DbOrTx, param: { token: string }) {
    const { refreshToken } = schema;

    return conn.delete(refreshToken).where(eq(refreshToken.token, param.token));
  }
}
