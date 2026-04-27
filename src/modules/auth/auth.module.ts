import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtProvider } from './jwt/jwt.provider';
import { JwtUtil } from './jwt/jwt.util';
import { AuthGuard } from './guard/auth.guard';
import { RoleGuard } from './guard/role.guard';
import { AuthUtil } from './auth.util';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtProvider, JwtUtil, AuthGuard, RoleGuard, AuthUtil],
  exports: [JwtUtil, AuthGuard, RoleGuard, AuthUtil],
})
export class AuthModule {}
