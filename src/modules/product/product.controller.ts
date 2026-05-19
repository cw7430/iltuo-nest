import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { type FastifyRequest } from 'fastify';

import { ProductService } from './product.service';
import { ApiSuccessResponse } from '@/common/decorator';
import { SuccessResponseDto } from '@/common/api/response';
import {
  CreateProductRequestDto,
  ProductDetailResponseDto,
  ProductResponseDto,
  ProductsRequestDto,
  ProductsResponseDto,
} from './dto';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';
import { CurrentUser } from '@/modules/auth/decorator';

@Controller('/api/v1/product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/:majorCategoryId')
  @ApiSuccessResponse(ProductsResponseDto)
  @ApiParam({
    name: 'majorCategoryId',
    description: '주 카테고리 일련번호',
    type: 'string',
    example: 1,
  })
  async products(
    @Param('majorCategoryId') majorCategoryId: bigint,
    @Query() reqDto: ProductsRequestDto,
  ) {
    return SuccessResponseDto.okWith(
      await this.productService.products(majorCategoryId, reqDto),
    );
  }

  @Get('/detail/:productId')
  @ApiSuccessResponse(ProductDetailResponseDto)
  @ApiParam({
    name: 'productId',
    description: '상품 일련번호',
    type: 'string',
    example: 1,
  })
  async product(@Param('productId') productId: bigint) {
    return SuccessResponseDto.okWith(
      await this.productService.product(productId),
    );
  }

  @Get('/recommended')
  @ApiSuccessResponse(ProductResponseDto)
  async recommendedProducts() {
    return SuccessResponseDto.okWith(
      await this.productService.recommendedProducts(),
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiSuccessResponse()
  async createproduct(
    @CurrentUser('userId') userId: bigint,
    @Body() requestDto: CreateProductRequestDto,
  ) {
    await this.productService.createproduct(userId, requestDto);
    return SuccessResponseDto.ok();
  }

  @Post('/upload/:productImageId')
  @UseGuards(AuthGuard)
  @ApiSuccessResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({
    name: 'productImageId',
    description: '제품 일련번호',
    type: 'number',
    example: 1,
  })
  async uploadProductImage(
    @CurrentUser('userId') userId: bigint,
    @Req() req: FastifyRequest,
    @Param('productImageId') productImageId: number,
  ) {
    await this.productService.uploadProductImage(userId, req, productImageId);
    return SuccessResponseDto.ok();
  }
}
