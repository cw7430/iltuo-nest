import { Inject, Injectable, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify/types/request';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';

import { ProductRepository } from './product.repository';
import { GlobalRepository } from '@/modules/global/global.repository';
import * as schema from '@/modules/database/schemas';
import {
  ProductResponseDto,
  ProductsResponseDto,
  CreateProductRequestDto,
  ProductsRequestDto,
} from './dto';
import { FileUtil } from '@/modules/file/file.util';
import { PageResponseDto } from '@/modules/global/dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly productRepository: ProductRepository,
    private readonly globalRepository: GlobalRepository,
    private readonly fileUtil: FileUtil,
  ) {}

  private readonly log = new Logger(ProductService.name);

  async recommendedProducts() {
    return plainToInstance(
      ProductResponseDto,
      await this.productRepository.findProductsByRecommended(this.db),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async products(majorCategoryId: bigint, reqDto: ProductsRequestDto) {
    const majorCategory = await this.globalRepository.findMajorCategoryById(
      this.db,
      majorCategoryId,
    );

    const minerCategories =
      await this.globalRepository.findMinerCategoriesByMajorCategoryId(
        this.db,
        majorCategoryId,
      );

    const products = await this.productRepository.findProducts(
      this.db,
      majorCategoryId,
      reqDto.minerCategoryId,
      reqDto.page,
      reqDto.size,
      reqDto.sort,
    );

    const totalElements = await this.productRepository.countProducts(this.db);

    const contents = plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });

    const pageProducts = PageResponseDto.of(contents, reqDto, totalElements);

    const res = {
      ...majorCategory,
      minerCategories,
      pageProducts,
    };

    return plainToInstance(ProductsResponseDto, res, {
      excludeExtraneousValues: true,
    });
  }

  async createproduct(userId: bigint, reqDto: CreateProductRequestDto) {
    const minerCategoryId = BigInt(reqDto.minerCategoryId);
    const price = BigInt(reqDto.price);
    const discountRate = reqDto.discountRate ? BigInt(reqDto.discountRate) : 0n;

    const [result] = await this.productRepository.createProduct(
      this.db,
      minerCategoryId,
      reqDto.productName,
      reqDto.productComments,
      price,
      discountRate,
    );

    this.log.log(
      `Create Product successfully for user ID: ${userId} Product ID: ${result.productId}`,
    );
  }

  async uploadProductImage(
    userId: bigint,
    req: FastifyRequest,
    productImageId: number,
  ) {
    const file = await req.file();

    const fileInfo = this.fileUtil.getFileInfo(file);

    try {
      const uploadImage = await this.fileUtil.uploadImage(fileInfo, 'products');

      const [result] = await this.productRepository.createProductImage(
        this.db,
        BigInt(productImageId),
        fileInfo.fileName,
        fileInfo.originalName,
        fileInfo.mimeType,
        uploadImage.fileSize,
      );

      this.log.log(
        `Create Product successfully for user ID: ${userId} Product ID: ${result.productImageId}`,
      );
    } catch (e) {
      await this.fileUtil
        .unlinkFile('img', 'product', fileInfo.fileName)
        .catch(() => {});
      throw e;
    }
  }
}
