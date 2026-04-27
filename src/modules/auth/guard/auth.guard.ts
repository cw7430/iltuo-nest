import { Injectable, CanActivate, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { JwtUtil } from '@/modules/auth/jwt/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtUtil: JwtUtil) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const token = this.jwtUtil.extractToken(request);

    await this.jwtUtil.validateAccessToken(token);

    const userId = await this.jwtUtil.extractUserIdFromAccessToken(token);
    const role = await this.jwtUtil.extractRoleFromAccessToken(token);

    request.user = {
      userId,
      role,
    };

    return true;
  }
}
