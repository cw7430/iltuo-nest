import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import * as path from 'path';

import { AppModule } from './app.module';
import { appConfig, swaggerConfig } from './common/config';
import { GlobalExceptionFilter, CustomException } from './common/api/exception';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          message: Object.values(err.constraints ?? {})[0] ?? 'Invalid value',
        }));
        return new CustomException('VALIDATION_ERROR', formattedErrors);
      },
    }),
  );

  await app.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });

  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: 'api/v1/files/',
  });

  const appConfigValue = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.enableCors({
    origin: appConfigValue.CORS_ORIGINS,
    credentials: true,
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  });

  if (appConfigValue.APP_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger-ui', app, document);
  }

  await app.listen(appConfigValue.PORT);
}

(async () => {
  await bootstrap();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
