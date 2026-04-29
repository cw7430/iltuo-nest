import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProductService } from './product.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import { CategoryResponseDto } from './dto';

@Controller('/api/v1/product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/categories')
  @ApiSuccessResponse(CategoryResponseDto)
  async categories() {
    return SuccessResponseDto.okWith(await this.productService.categories());
  }
}
