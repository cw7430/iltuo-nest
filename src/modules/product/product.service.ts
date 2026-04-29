import { Inject, Injectable, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify/types/request';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { ProductRepository } from './product.repository';
import * as schema from '@/modules/database/schemas';
import { CustomException } from '@/common/api/exception';
import { CategoryResponseDto, ProductImageRequestDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly productRepository: ProductRepository,
  ) {}

  private readonly log = new Logger(ProductService.name);

  async categories(): Promise<CategoryResponseDto[]> {
    const majorCategories = await this.productRepository.findAllMajorCategories(
      this.db,
    );
    const minerCategories = await this.productRepository.findAllMinerCategories(
      this.db,
    );

    if (!majorCategories || !minerCategories) {
      throw new CustomException('RESOURCE_NOT_FOUND');
    }

    const response = majorCategories.map((majorCategory) => {
      const minerCategory = minerCategories.filter(
        (minerCategory) =>
          minerCategory.majorCategoryId === majorCategory.majorCategoryId,
      );
      return { ...majorCategory, minerCategories: minerCategory };
    });

    return plainToInstance(CategoryResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async productImage(
    req: FastifyRequest,
    reqDto: ProductImageRequestDto,
  ): Promise<void> {
    const file = await req.file();

    if (!file) {
      throw new CustomException('RESOURCE_NOT_FOUND');
    }

    const mimeType = file.mimetype;

    if (!mimeType.startsWith('image/')) {
      throw new CustomException('CONFLICT');
    }

    const fileName = randomUUID();
    const originalName = file.filename;

    await this.productRepository.createProductImage(
      this.db,
      reqDto.productImageId,
      fileName,
      originalName,
      mimeType,
      reqDto.fileSize,
    );
  }
}
