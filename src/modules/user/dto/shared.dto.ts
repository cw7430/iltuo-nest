import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginAndRefreshResponseDto {
  @Expose()
  @ApiProperty({ description: 'Access Token', type: String })
  accessToken!: string;

  @Expose()
  @ApiProperty({ description: 'Refresh Token', type: String })
  refreshToken!: string;

  @Expose()
  @ApiProperty({ description: 'Access Token 만료시간', type: Number })
  accessTokenExpiresAtMs!: number;

  @Expose()
  @ApiProperty({ description: 'Refresh Token 만료시간', type: Number })
  refreshTokenExpiresAtMs!: number;

  @Expose()
  @ApiProperty({ description: '권한', type: String, example: 'USER' })
  authRole!: 'USER' | 'ADMIN';

  @Expose()
  @ApiProperty({ description: '로그인 방식', type: String, example: 'NATIVE' })
  authType!: 'NATIVE' | 'SOCIAL';
}
