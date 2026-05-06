import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GlobalService } from './global.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import { CategoryResponseDto } from './dto';

@Controller('/api/v1')
@ApiTags('global')
export class GlobalController {
  constructor(private readonly globalService: GlobalService) {}

  @Get()
  getHello(): string {
    return this.globalService.getHello();
  }

  @Get('/categories')
  @ApiSuccessResponse(CategoryResponseDto)
  async categories() {
    return SuccessResponseDto.okWith(await this.globalService.categories());
  }
}
