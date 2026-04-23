import { registerAs } from '@nestjs/config';

export interface DbConfig {
  HOST: string;
  PORT: number;
  USER: string;
  PASSWORD: string;
  NAME: string;
  SSL: boolean;
}

export const dbConfig = registerAs(
  'db',
  (): DbConfig => ({
    HOST: process.env.DB_HOST ?? 'localhost',
    PORT: Number(process.env.DB_PORT ?? 3306),
    USER: process.env.DB_USER ?? 'root',
    PASSWORD: (() => {
      if (!process.env.DB_PASSWORD) {
        throw new Error('DB_PASSWORD is not set');
      }
      return process.env.DB_PASSWORD;
    })(),
    NAME: process.env.DB_NAME ?? 'iltuo',
    SSL: process.env.APP_ENV === 'production' ? true : false,
  }),
);