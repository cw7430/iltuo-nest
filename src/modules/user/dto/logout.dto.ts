import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutRequestDto {
  @IsOptional()
  @ApiProperty({
    description: 'Refresh Token',
    type: String,
  })
  refreshToken: string | null = null;
}
