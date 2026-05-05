import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutRequestDto {
  @IsOptional()
  @ApiProperty({
    description: 'Refresh Token',
    type: String,
    nullable: true,
  })
  refreshToken: string | null = null;
}
