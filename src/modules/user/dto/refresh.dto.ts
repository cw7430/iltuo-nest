import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshRequestDto {
  @IsOptional()
  @ApiProperty({
    description: '자동로그인 여부',
    type: Boolean,
    example: false,
  })
  isAuto: boolean = false;
}

export class LogoutRequestDto {
  @IsOptional()
  @ApiProperty({
    description: 'Refresh Token',
    type: String,
    nullable: true,
  })
  refreshToken: string | null = null;
}
