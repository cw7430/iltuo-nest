import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { type AuthenticatedUser } from '@/modules/auth/types';

export const CurrentUser = createParamDecorator(
  (key: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return key ? request.user?.[key] : request.user;
  },
);
