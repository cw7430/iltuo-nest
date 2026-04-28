import { Injectable, Inject, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';

import { UserRepository } from './user.repository';
import { AuthUtil } from '@/modules/auth/auth.util';
import {
  LoginRequestDto,
  LoginAndRefreshResponseDto,
  RefreshRequestDto,
  LogoutRequestDto,
} from './dto';
import { CustomException } from '@/common/api/exception';
import * as schema from '@/modules/database/schemas';

@Injectable()
export class UserService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly userRepository: UserRepository,
    private readonly authUtil: AuthUtil,
  ) {}

  private readonly log = new Logger(UserService.name);

  async nativeLogin(
    reqDto: LoginRequestDto,
  ): Promise<LoginAndRefreshResponseDto> {
    const signInResult =
      await this.userRepository.findNativeLoginInfoByUserName(
        this.db,
        reqDto.userName,
      );

    if (!signInResult) {
      throw new CustomException('LOGIN_ERROR');
    }

    if (signInResult.authRole === 'LEFT') {
      throw new CustomException('LOGIN_ERROR');
    }

    if (!(await bcrypt.compare(reqDto.password, signInResult.passwordHash))) {
      throw new CustomException('LOGIN_ERROR');
    }

    const { tokenResponse, refreshTokenExpiresAt } =
      await this.authUtil.issueTokens(
        signInResult.userId,
        signInResult.authRole,
        reqDto.isAuto,
      );

    await this.userRepository.createRefreshToken(
      this.db,
      signInResult.userId,
      tokenResponse.refreshToken,
      refreshTokenExpiresAt,
    );

    const response = {
      ...tokenResponse,
      authRole: signInResult.authRole,
      authType: signInResult.authType,
    };

    this.log.log(`Sign In successfully for user ID: ${signInResult.userId}`);

    return plainToInstance(LoginAndRefreshResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async refresh(
    req: FastifyRequest,
    reqDto: RefreshRequestDto,
  ): Promise<LoginAndRefreshResponseDto> {
    const formalTokenInfo = await this.authUtil.getFormalRefreshInfo(req);

    const isRefreshTokenIn = await this.userRepository.existsByUserIdAndToken(
      this.db,
      formalTokenInfo.userId,
      formalTokenInfo.refreshToken,
    );

    if (!isRefreshTokenIn) {
      throw new CustomException('UNAUTHORIZED');
    }

    const refreshResult = await this.userRepository.findRefreshInfoByUserId(
      this.db,
      formalTokenInfo.userId,
    );

    if (!refreshResult) {
      throw new CustomException('UNAUTHORIZED');
    }

    if (refreshResult.authRole === 'LEFT') {
      throw new CustomException('LOGIN_ERROR');
    }

    const { tokenResponse, refreshTokenExpiresAt } =
      await this.authUtil.issueTokens(
        formalTokenInfo.userId,
        refreshResult.authRole,
        reqDto.isAuto,
      );

    await this.db.transaction(async (tx) => {
      await this.userRepository.deleteRefreshTokenByToken(
        tx,
        formalTokenInfo.refreshToken,
      );
      await this.userRepository.createRefreshToken(
        tx,
        formalTokenInfo.userId,
        tokenResponse.refreshToken,
        refreshTokenExpiresAt,
      );
    });

    const response = {
      ...tokenResponse,
      authRole: refreshResult.authRole,
      authType: refreshResult.authType,
    };

    this.log.log(
      `Refresh Token successfully for user ID: ${formalTokenInfo.userId}`,
    );

    return plainToInstance(LoginAndRefreshResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async logout(reqDto: LogoutRequestDto): Promise<void> {
    if (!reqDto.refreshToken) return;

    await this.userRepository.deleteRefreshTokenByToken(
      this.db,
      reqDto.refreshToken,
    );
  }
}
