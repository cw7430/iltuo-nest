import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

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

  const appConfigValue = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

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
