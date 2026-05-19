import { Global, Module } from '@nestjs/common';

import { GlobalRepository } from './global.repository';
import { GlobalService } from './global.service';
import { GlobalController } from './global.controller';
import { GlobalUtil } from './golbal.util';

@Global()
@Module({
  providers: [GlobalRepository, GlobalService, GlobalUtil],
  controllers: [GlobalController],
  exports: [GlobalRepository, GlobalUtil],
})
export class GlobalModule {}
