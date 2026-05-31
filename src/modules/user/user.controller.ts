import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from './user.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import {
  LoginRequestDto,
  RefreshRequestDto,
  LoginAndRefreshResponseDto,
  LogoutRequestDto,
  CheckUserRequestDto,
  NativeRegisterRequestDto,
  UserResponseDto,
} from './dto';
import { CurrentUser } from '@/modules/auth/decorator';

@Controller('/api/v1/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login/native')
  @ApiBody({ type: LoginRequestDto })
  @ApiSuccessResponse(LoginAndRefreshResponseDto)
  async nativeLogIn(@Body() reqDto: LoginRequestDto) {
    return SuccessResponseDto.okWith(
      await this.userService.nativeLogin(reqDto),
    );
  }

  @Post('/refresh')
  @ApiBearerAuth('refreshToken')
  @ApiBody({ type: RefreshRequestDto })
  @ApiSuccessResponse(LoginAndRefreshResponseDto)
  async refresh(@Req() req: FastifyRequest, @Body() reqDto: RefreshRequestDto) {
    return SuccessResponseDto.okWith(
      await this.userService.refresh(req, reqDto),
    );
  }

  @Post('/logout')
  @ApiBody({ type: LogoutRequestDto })
  @ApiSuccessResponse()
  async logout(@Body() reqDto: LogoutRequestDto) {
    await this.userService.logout(reqDto);
    return SuccessResponseDto.ok();
  }

  @Post('/check-user')
  @ApiBody({ type: CheckUserRequestDto })
  @ApiSuccessResponse()
  async checkUser(@Body() reqDto: CheckUserRequestDto) {
    await this.userService.checkUser(reqDto);
    return SuccessResponseDto.ok();
  }

  @Post('/register/native')
  @ApiBody({ type: NativeRegisterRequestDto })
  @ApiSuccessResponse(LoginAndRefreshResponseDto)
  async nativeRegister(reqDto: NativeRegisterRequestDto) {
    return SuccessResponseDto.okWith(
      await this.userService.nativeRegister(reqDto),
    );
  }

  @Get()
  @ApiSuccessResponse(UserResponseDto)
  async getUser(@CurrentUser('userId') userId: bigint) {
    return SuccessResponseDto.okWith(await this.userService.getUser(userId));
  }
}
