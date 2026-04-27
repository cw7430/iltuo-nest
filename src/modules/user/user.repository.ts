import { Injectable } from '@nestjs/common';
import { sql, eq, ne, and } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class UserRepository {
  async findNativeSignInInfoByUserName(conn: DbOrTx, userName: string) {
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
          eq(user.userName, userName),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .innerJoin(nativeUser, eq(user.userId, nativeUser.nativeUserId))
      .limit(1);

    return result[0] ?? undefined;
  }

  async existsByUserName(conn: DbOrTx, userName: string) {
    const { user } = schema;

    const [row] = await conn
      .select({ exists: sql<boolean>`true` })
      .from(user)
      .where(
        and(
          eq(user.userName, userName),
          ne(user.authType, 'SOCIAL'),
          ne(user.authRole, 'LEFT'),
        ),
      )
      .limit(1);

    return !!row;
  }

  async createRefreshToken(
    conn: DbOrTx,
    userId: bigint,
    token: string,
    expiresAt: Date,
  ) {
    const { refreshToken } = schema;

    return conn
      .insert(refreshToken)
      .values({ userId, token, expiresAt })
      .returning({ refreshTokenId: refreshToken.refreshTokenId });
  }
}
