import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { type FastifyRequest } from 'fastify';

import { ProductService } from './product.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import {
  CategoryResponseDto,
  CreateProductRequestDto,
} from './dto';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { CurrentUser } from '@/modules/auth/decorator';

@Controller('/api/v1/product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/categories')
  @ApiSuccessResponse(CategoryResponseDto)
  async categories() {
    return SuccessResponseDto.okWith(await this.productService.categories());
  }

  @Post('/product')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiSuccessResponse()
  async createproduct(
    @CurrentUser('userId') userId: bigint,
    @Req() req: FastifyRequest,
    @Body() requestDto: CreateProductRequestDto,
  ) {
    await this.productService.createproduct(userId, req, requestDto);
    return SuccessResponseDto.ok();
  }

  @Post('/upload')
  @ApiSuccessResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        productImageId: {
          type: 'string',
          description: '일련번호',
          example: '1',
        },
      },
    },
  })
  async productImage(@Req() req: FastifyRequest) {
    await this.productService.productImage(req);
    return SuccessResponseDto.ok();
  }
}
