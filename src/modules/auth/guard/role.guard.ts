import { Injectable, CanActivate, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { CustomException } from '@/common/api/exception';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const user = request.user;
    if (!user) {
      throw new CustomException('UNAUTHORIZED');
    }

    if (user.role !== 'ADMIN') {
      throw new CustomException('FORBIDDEN');
    }

    return true;
  }
}
