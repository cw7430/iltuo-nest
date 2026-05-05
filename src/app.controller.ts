import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import { CategoryResponseDto } from './dto';

@Controller('/api/v1')
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/categories')
  @ApiSuccessResponse(CategoryResponseDto)
  async categories() {
    return SuccessResponseDto.okWith(await this.appService.categories());
  }
}
