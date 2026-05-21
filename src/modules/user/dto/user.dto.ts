import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  password!: string;
  realName!: string;
  phoneNumber!: string;
  email!: string;
}
