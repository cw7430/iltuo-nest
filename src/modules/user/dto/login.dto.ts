import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
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
