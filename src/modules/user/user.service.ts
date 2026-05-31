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
  NativeRegisterRequestDto,
  CheckUserRequestDto,
  UserResponseDto,
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

  async nativeLogin(reqDto: LoginRequestDto) {
    const signInResult =
      await this.userRepository.findNativeLoginInfoByUserName(this.db, {
        userName: reqDto.userName,
      });

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

    await this.userRepository.createRefreshToken(this.db, {
      userId: signInResult.userId,
      token: tokenResponse.refreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    const res = {
      ...tokenResponse,
      authRole: signInResult.authRole,
      authType: signInResult.authType,
      isAuto: reqDto.isAuto,
    };

    this.log.log(`Login successfully for user ID: ${signInResult.userId}`);

    return plainToInstance(LoginAndRefreshResponseDto, res, {
      excludeExtraneousValues: true,
    });
  }

  async refresh(req: FastifyRequest, reqDto: RefreshRequestDto) {
    const formalTokenInfo = await this.authUtil.getFormalRefreshInfo(req);

    const isRefreshTokenIn =
      await this.userRepository.existsUserByUserIdAndToken(this.db, {
        userId: formalTokenInfo.userId,
        token: formalTokenInfo.refreshToken,
      });

    if (!isRefreshTokenIn) {
      throw new CustomException('UNAUTHORIZED');
    }

    const refreshResult = await this.userRepository.findRefreshInfoByUserId(
      this.db,
      { userId: formalTokenInfo.userId },
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
      await this.userRepository.deleteRefreshTokenByToken(tx, {
        token: formalTokenInfo.refreshToken,
      });
      await this.userRepository.createRefreshToken(tx, {
        userId: formalTokenInfo.userId,
        token: tokenResponse.refreshToken,
        expiresAt: refreshTokenExpiresAt,
      });
    });

    const response = {
      ...tokenResponse,
      authRole: refreshResult.authRole,
      authType: refreshResult.authType,
      isAuto: reqDto.isAuto,
    };

    this.log.log(
      `Refresh Token successfully for user ID: ${formalTokenInfo.userId}`,
    );

    return plainToInstance(LoginAndRefreshResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async logout(reqDto: LogoutRequestDto) {
    if (!reqDto.refreshToken) return;

    await this.userRepository.deleteRefreshTokenByToken(this.db, {
      token: reqDto.refreshToken,
    });
  }

  async checkUser(reqDto: CheckUserRequestDto) {
    const check = await this.userRepository.existsUserByUserName(this.db, {
      userName: reqDto.userName,
    });

    if (!check) {
      this.log.warn(`User Name is Duplicated: ${reqDto.userName}`);
      throw new CustomException('CONFLICT');
    }

    this.log.log(`User Name is Checked: ${reqDto.userName}`);
  }

  async nativeRegister(reqDto: NativeRegisterRequestDto) {
    await this.checkUser(reqDto);

    const passwordHash = await bcrypt.hash(reqDto.password, 10);

    const res = await this.db.transaction(async (tx) => {
      const [user] = await this.userRepository.createUser(tx, {
        userName: reqDto.userName,
        realName: reqDto.realName,
        phoneNumber: reqDto.phoneNumber,
        email: reqDto.email,
        authType: 'NATIVE',
      });
      const [nativeUser] = await this.userRepository.createNativeUser(tx, {
        nativeUserId: user.userId,
        passwordHash,
      });

      return { userId: nativeUser.nativeUserId };
    });

    this.log.log(`Register successfully for user ID: ${res.userId}`);
  }

  async getUser(userId: bigint) {
    const res = await this.userRepository.findUserById(this.db, { userId });

    if (!res) {
      throw new CustomException('UNAUTHORIZED');
    }

    return plainToInstance(UserResponseDto, res, {
      excludeExtraneousValues: true,
    });
  }
}
