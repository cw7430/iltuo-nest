import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';

import { jwtConfig } from '@/common/config';
import type {
  AccessTokenClaims,
  RefreshTokenClaims,
} from '@/modules/auth/types';

@Injectable()
export class JwtProvider {
  private readonly log = new Logger(JwtProvider.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * AccessToken 생성
   */
  async generateAccessToken(id: bigint, userRole: 'USER' | 'ADMIN') {
    const payload = {
      sub: id.toString(),
      role: userRole,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.JWT_ACCESS_SECRET,
      expiresIn: this.config.JWT_ACCESS_EXPIRATION,
    });

    const decoded = this.jwtService.decode<AccessTokenClaims>(token);

    return {
      token,
      expiresAtMs: decoded.exp * 1000,
    };
  }

  /**
   * RefreshToken 생성
   */
  async generateRefreshToken(id: bigint, isAuto: boolean) {
    const payload = { sub: id.toString() };

    const expiresIn = isAuto ? '365d' : this.config.JWT_REFRESH_EXPIRATION;

    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.JWT_REFRESH_SECRET,
      expiresIn: expiresIn,
    });

    const decoded = this.jwtService.decode<RefreshTokenClaims>(token);

    return {
      token,
      expiresAtMs: decoded.exp * 1000,
    };
  }

  /**
   * AccessToken Claim 변환 (Verify)
   */
  async parseAccessClaims(token: string): Promise<AccessTokenClaims | null> {
    try {
      return await this.jwtService.verifyAsync<AccessTokenClaims>(token, {
        secret: this.config.JWT_ACCESS_SECRET,
      });
    } catch (error: unknown) {
      this.handleJwtError(error);
      return null;
    }
  }

  /**
   * RefreshToken Claim 변환 (Verify)
   */
  async parseRefreshClaims(token: string): Promise<RefreshTokenClaims | null> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenClaims>(token, {
        secret: this.config.JWT_REFRESH_SECRET,
      });
    } catch (error: unknown) {
      this.handleJwtError(error);
      return null;
    }
  }

  private handleJwtError(error: unknown): void {
    if (error instanceof TokenExpiredError) {
      this.log.debug('JWT expired');
    } else if (error instanceof Error) {
      this.log.warn(`Invalid JWT: ${error.message}`);
    } else {
      this.log.warn('An unknown error occurred during JWT verification');
    }
  }
}
