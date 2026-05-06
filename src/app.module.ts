import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig, dbConfig, jwtConfig } from './common/config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { GlobalModule } from './modules/global/global.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig, dbConfig, jwtConfig],
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    GlobalModule,
    UserModule,
    ProductModule,
  ],
})
export class AppModule {}
