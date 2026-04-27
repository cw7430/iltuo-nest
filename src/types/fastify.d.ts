import 'fastify';
import { AuthenticatedUser } from '@/modules/auth/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
