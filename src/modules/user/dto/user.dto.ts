import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { TransformBigintToString } from '@/common/decorator';

export class LoginRequestDto {
  @IsString({
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  })
  @MaxLength(255, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  @ApiProperty({
    description: '사용자 아이디',
    type: String,
    example: 'example123',
  })
  userName!: string;

  @IsString({
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  })
  @MaxLength(255, { message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  @ApiProperty({
    description: '사용자 비밀번호',
    type: String,
    example: 'password123',
  })
  password!: string;

  @IsOptional()
  @ApiProperty({
    description: '자동로그인 여부',
    type: Boolean,
    example: false,
  })
  isAuto: boolean = false;
}

export class CheckUserRequestDto {
  @IsString({
    message: '아이디 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '아이디를 입력해 주세요.',
  })
  @Matches(/^(?=.*[A-Za-z])[A-Za-z0-9]{5,25}$/, {
    message:
      '아이디는 5자 이상 25자 이하, 영문 또는 영문, 숫자의 조합이어야 합니다.',
  })
  @ApiProperty({
    description: '사용자 아이디',
    type: String,
    example: 'example123',
  })
  userName!: string;
}

export class NativeRegisterRequestDto extends CheckUserRequestDto {
  constructor() {
    super();
  }

  @IsString({
    message: '비밀번호 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '비밀번호를 입력해 주세요.',
  })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|:;"'<>,.?/~`]).{10,25}$/,
    {
      message:
        '비밀번호는 10자 이상 25자 이하, 영문, 숫자, 특수문자의 조합이어야 합니다.',
    },
  )
  @ApiProperty({
    description: '사용자 비밀번호',
    type: String,
    example: 'password123',
  })
  password!: string;

  @IsString({
    message: '이름 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '이름을 입력해 주세요.',
  })
  @ApiProperty({
    description: '사용자 이름',
    type: String,
    example: '홍길동',
  })
  realName!: string;

  @IsString({
    message: '휴대전화 번호 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '휴대전화 번호을 입력해 주세요.',
  })
  @Matches(/^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/, {
    message: '휴대전화 번호 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '사용자 휴대전화 번호',
    example: '010-0000-0000',
  })
  phoneNumber!: string;

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @IsNotEmpty({
    message: '이메일을 입력하여주세요.',
  })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  email!: string;
}

export class UserResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '회원 일련번호',
    type: String,
    example: '1',
  })
  userId!: bigint;

  @Expose()
  @ApiProperty({
    description: '사용자 아이디',
    type: String,
    example: 'example123',
  })
  userName!: string;

  @Expose()
  @ApiProperty({
    description: '사용자 이름',
    type: String,
    example: '홍길동',
    nullable: true,
  })
  realName!: string | null;

  @Expose()
  @ApiProperty({
    description: '사용자 휴대전화 번호',
    example: '010-0000-0000',
    nullable: true,
  })
  phoneNumber!: string | null;

  @Expose()
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
    nullable: true,
  })
  email!: string | null;

  @Expose()
  @ApiProperty({ description: '권한', type: String, example: 'USER' })
  authRole!: 'USER' | 'ADMIN';

  @Expose()
  @ApiProperty({ description: '로그인 방식', type: String, example: 'NATIVE' })
  authType!: 'NATIVE' | 'SOCIAL' | 'CROSS';

  @Expose()
  @ApiProperty({ description: '생성일', type: Date })
  createdAt!: Date;

  @Expose()
  @ApiProperty({ description: '수정일', type: Date })
  updatedAt!: Date;

  @Expose()
  @ApiProperty({ description: '삭제일', type: Date, nullable: true })
  deletedAt!: Date | null;
}
