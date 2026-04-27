import { Injectable } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { JwtProvider } from './jwt/jwt.provider';
import { JwtUtil } from './jwt/jwt.util';

@Injectable()
export class AuthUtil {
  constructor(
    private readonly jwtProvider: JwtProvider,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async issueTokens(
    userId: bigint,
    authRole: 'USER' | 'ADMIN',
    isAuto: boolean,
  ) {
    const [accessTokenInfo, refreshTokenInfo] = await Promise.all([
      this.jwtProvider.generateAccessToken(userId, authRole),
      this.jwtProvider.generateRefreshToken(userId, isAuto),
    ]);

    return {
      tokenResponse: {
        accessToken: accessTokenInfo.token,
        accessTokenExpiresAtMs: accessTokenInfo.expiresAtMs,
        refreshToken: refreshTokenInfo.token,
        refreshTokenExpiresAtMs: refreshTokenInfo.expiresAtMs,
      },
      refreshTokenExpiresAt: new Date(refreshTokenInfo.expiresAtMs),
    };
  }

  async getFormalRefreshInfo(request: FastifyRequest) {
    const refreshToken = this.jwtUtil.extractToken(request);
    const userId =
      await this.jwtUtil.extractUserIdFromRefreshToken(refreshToken);

    return { refreshToken, userId };
  }
}
