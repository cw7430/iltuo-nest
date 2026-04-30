import { Inject, Injectable, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify/types/request';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';

import { ProductRepository } from './product.repository';
import * as schema from '@/modules/database/schemas';
import { CustomException } from '@/common/api/exception';
import {
  CategoryResponseDto,
  CreateProductRequestDto,
  ProductImageRequestDto,
} from './dto';
import { FileUtil } from '@/modules/file/file.util';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly productRepository: ProductRepository,
    private readonly fileUtil: FileUtil,
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

  async createproduct(
    userId: bigint,
    req: FastifyRequest,
    reqDto: CreateProductRequestDto,
  ): Promise<void> {
    const file = await req.file();

    const uploadImage = await this.fileUtil.uploadImage(file, 'products');

    const minerCategoryId = BigInt(reqDto.minerCategoryId);
    const price = BigInt(reqDto.price);
    const discountRate = reqDto.discountRate ? BigInt(reqDto.discountRate) : 0n;

    try {
      const result = await this.db.transaction(async (tx) => {
        const [product] = await this.productRepository.createProduct(
          tx,
          minerCategoryId,
          reqDto.productName,
          reqDto.productComments,
          price,
          discountRate,
        );
        await this.productRepository.createProductImage(
          tx,
          product.productId,
          uploadImage.fileName,
          uploadImage.originalName,
          uploadImage.mimeType,
          uploadImage.fileSize,
        );
        return product;
      });

      this.log.log(
        `Create Product successfully for user ID: ${userId} Product ID: ${result.productId}`,
      );
    } catch (e) {
      await this.fileUtil
        .unlinkFile('img', 'product', uploadImage.fileName)
        .catch(() => {});
      throw e;
    }
  }

  async productImage(req: FastifyRequest): Promise<void> {
    const file = await req.file();

    if (!file) {
      throw new CustomException('RESOURCE_NOT_FOUND');
    }

    const reqDto = plainToInstance(ProductImageRequestDto, file.fields);
    const uploadImage = await this.fileUtil.uploadImage(file, 'products');

    await this.productRepository.createProductImage(
      this.db,
      BigInt(reqDto.productImageId),
      uploadImage.fileName,
      uploadImage.originalName,
      uploadImage.mimeType,
      uploadImage.fileSize,
    );
  }
}
