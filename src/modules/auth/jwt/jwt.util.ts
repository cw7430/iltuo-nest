import { Injectable } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { JwtProvider } from './jwt.provider';
import { CustomException } from '@/common/api/exception';

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtProvider: JwtProvider) {}

  private async getAccessClaims(token: string) {
    const claims = await this.jwtProvider.parseAccessClaims(token);
    if (!claims) {
      throw new CustomException('UNAUTHORIZED');
    }
    return claims;
  }

  private async getRefreshClaims(token: string) {
    const claims = await this.jwtProvider.parseRefreshClaims(token);
    if (!claims) {
      throw new CustomException('UNAUTHORIZED');
    }
    return claims;
  }

  /**
   * Token 추출
   */
  extractToken(request: FastifyRequest): string {
    const header = request.headers.authorization;

    if (!header) {
      throw new CustomException('UNAUTHORIZED');
    }

    const match = header.match(/^bearer\s+(.+)$/i);

    if (!match) {
      throw new CustomException('UNAUTHORIZED');
    }

    return match[1].trim();
  }

  /**
   * AccessToken 검증
   */
  async validateAccessToken(token: string) {
    await this.getAccessClaims(token);
  }

  /**
   * AccessToken 에서 userId 추출
   */
  async extractUserIdFromAccessToken(token: string) {
    return BigInt((await this.getAccessClaims(token)).sub);
  }

  /**
   * AccessToken 에서 Role 추출
   */
  async extractRoleFromAccessToken(token: string) {
    return (await this.getAccessClaims(token)).role;
  }

  /**
   * RefreshToken 에서 userId 추출
   */
  async extractUserIdFromRefreshToken(token: string) {
    return BigInt((await this.getRefreshClaims(token)).sub);
  }
}
