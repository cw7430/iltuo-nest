import {
  Body,
  Controller,
  Get,
  Param,
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
import { CategoryResponseDto, CreateProductRequestDto } from './dto';
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

  @Post()
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

  @Post('/upload/:productImageId')
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
    example: '1',
  })
  async productImage(
    @Req() req: FastifyRequest,
    @Param('productImageId') productImageId: number,
  ) {
    await this.productService.productImage(req, productImageId);
    return SuccessResponseDto.ok();
  }
}
