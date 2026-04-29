export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly APP_ENV: 'local' | 'development' | 'production';
      readonly PORT: string;
      readonly CORS_ORIGINS: string;
      readonly DB_HOST: string;
      readonly DB_PORT: string;
      readonly DB_USER: string;
      readonly DB_PASSWORD: string;
      readonly DB_NAME: string;
      readonly JWT_ACCESS_SECRET: string;
      readonly JWT_ACCESS_EXPIRATION: string;
      readonly JWT_REFRESH_SECRET: string;
      readonly JWT_REFRESH_EXPIRATION: string;
    }
  }
}
