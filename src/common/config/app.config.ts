import { registerAs } from '@nestjs/config';

export interface AppConfig {
  APP_ENV: 'local' | 'development' | 'production';
  PORT: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    APP_ENV:
      (process.env.NODE_ENV as 'local' | 'development' | 'production') ??
      'local',
    PORT: Number(process.env.PORT ?? 4000),
  }),
);
