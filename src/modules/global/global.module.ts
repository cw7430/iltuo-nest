import { Global, Module } from '@nestjs/common';

import { GlobalRepository } from './global.repository';
import { GlobalService } from './global.service';
import { GlobalController } from './global.controller';

@Global()
@Module({
  providers: [GlobalRepository, GlobalService],
  controllers: [GlobalController],
  exports: [GlobalRepository],
})
export class GlobalModule {}
