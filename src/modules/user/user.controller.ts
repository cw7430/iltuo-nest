import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

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
  AddressResponseDto,
  AddressRequestDto,
} from './dto';
import { CurrentUser } from '@/modules/auth/decorator';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';

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
  async nativeRegister(@Body() reqDto: NativeRegisterRequestDto) {
    return SuccessResponseDto.okWith(
      await this.userService.nativeRegister(reqDto),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiSuccessResponse(UserResponseDto)
  async getUser(@CurrentUser('userId') userId: bigint) {
    return SuccessResponseDto.okWith(await this.userService.getUser(userId));
  }

  @Get('/address')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiSuccessResponse(AddressResponseDto)
  async getAddress(@CurrentUser('userId') userId: bigint) {
    return SuccessResponseDto.okWith(await this.userService.getAddress(userId));
  }

  @Post('/address')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiBody({ type: AddressRequestDto })
  @ApiSuccessResponse()
  async createAddress(
    @CurrentUser('userId') userId: bigint,
    @Body() reqDto: AddressRequestDto,
  ) {
    await this.userService.createAddress(userId, reqDto);
    return SuccessResponseDto.ok();
  }

  @Patch('/address/:addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiBody({ type: AddressRequestDto })
  @ApiParam({
    name: 'addressId',
    description: '주소 일련번호',
    type: 'string',
    example: 1,
  })
  @ApiSuccessResponse()
  async updateAddress(
    @Param('addressId') addressId: bigint,
    @Body() reqDto: AddressRequestDto,
  ) {
    await this.userService.updateAddress(addressId, reqDto);
    return SuccessResponseDto.ok();
  }

  @Patch('/address/main/:addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiParam({
    name: 'addressId',
    description: '주소 일련번호',
    type: 'string',
    example: 1,
  })
  @ApiSuccessResponse()
  async updateMainAddress(
    @Param('addressId') addressId: bigint,
    @CurrentUser('userId') userId: bigint,
  ) {
    await this.userService.updateMainAddress(addressId, userId);
    return SuccessResponseDto.ok();
  }

  @Patch('/address/invalidate/:addressId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiParam({
    name: 'addressId',
    description: '주소 일련번호',
    type: 'string',
    example: 1,
  })
  @ApiSuccessResponse()
  async invalidateAddress(@Param('addressId') addressId: bigint) {
    await this.userService.invalidateAddress(addressId);
    return SuccessResponseDto.ok();
  }
}
