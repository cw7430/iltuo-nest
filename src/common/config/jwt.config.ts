import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export interface JwtConfig {
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: StringValue;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: StringValue;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    JWT_ACCESS_SECRET: (() => {
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not set');
      }
      return process.env.JWT_ACCESS_SECRET;
    })(),
    JWT_ACCESS_EXPIRATION: (process.env.JWT_ACCESS_EXPIRATION ??
      '30m') as StringValue,
    JWT_REFRESH_SECRET: (() => {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not set');
      }
      return process.env.JWT_REFRESH_SECRET;
    })(),
    JWT_REFRESH_EXPIRATION: (process.env.JWT_REFRESH_EXPIRATION ??
      '14d') as StringValue,
  }),
);
