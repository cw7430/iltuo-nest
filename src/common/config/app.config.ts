import { registerAs } from '@nestjs/config';

export interface AppConfig {
  APP_ENV: 'local' | 'development' | 'production';
  PORT: number;
  CORS_ORIGINS: string[];
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    APP_ENV:
      (process.env.NODE_ENV as 'local' | 'development' | 'production') ??
      'local',
    PORT: Number(process.env.PORT ?? 4000),
    CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',').map((v) => v.trim()) ?? [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
  }),
);
