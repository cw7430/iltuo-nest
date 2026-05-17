import { Injectable } from '@nestjs/common';
import { and, eq, asc, desc, type SQL } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class ProductRepository {
  private findAllProducts(conn: DbOrTx) {
    const { product, productImage, minerCategory, majorCategory } = schema;
    const {
      productId,
      minerCategoryId,
      productName,
      productComments,
      price,
      discountedRate,
      isRecommended,
      isValid,
      createdAt,
      updatedAt,
      deletedAt,
    } = product;
    const { productImageId, fileName } = productImage;

    return conn
      .select({
        productId,
        minerCategoryId,
        productName,
        productComments,
        fileName,
        price,
        discountedRate,
        isRecommended,
        isValid,
        createdAt,
        updatedAt,
        deletedAt,
      })
      .from(product)
      .innerJoin(productImage, eq(productId, productImageId))
      .innerJoin(
        minerCategory,
        eq(minerCategoryId, minerCategory.minerCategoryId),
      )
      .innerJoin(
        majorCategory,
        eq(minerCategory.majorCategoryId, majorCategory.majorCategoryId),
      );
  }

  private sortProducts(
    sort:
      | 'recommended'
      | 'priceAsc'
      | 'priceDesc'
      | 'createdAsc'
      | 'createdDesc' = 'recommended',
  ) {
    const { product } = schema;

    const orderByMap: Record<string, SQL<unknown>[]> = {
      recommended: [
        desc(product.isRecommended),
        desc(product.createdAt),
        asc(product.price),
      ],
      createdDesc: [
        desc(product.createdAt),
        desc(product.isRecommended),
        asc(product.price),
      ],
      createdAsc: [
        asc(product.createdAt),
        desc(product.isRecommended),
        asc(product.price),
      ],
      priceAsc: [
        asc(product.price),
        desc(product.isRecommended),
        desc(product.createdAt),
      ],
      priceDesc: [
        desc(product.price),
        desc(product.isRecommended),
        desc(product.createdAt),
      ],
    };

    return orderByMap[sort] || orderByMap.recommended;
  }

  async findProducts(
    conn: DbOrTx,
    majorCategoryId: bigint,
    minerCategoryId: bigint,
    page: number,
    size: number,
    sort:
      | 'recommended'
      | 'priceAsc'
      | 'priceDesc'
      | 'createdAsc'
      | 'createdDesc' = 'recommended',
  ) {
    const { product, majorCategory } = schema;

    const query = this.findAllProducts(conn);

    const whereClause =
      minerCategoryId === 0n
        ? eq(majorCategory.majorCategoryId, majorCategoryId)
        : eq(product.minerCategoryId, minerCategoryId);

    const orderSpecs = this.sortProducts(sort);

    const result = await query
      .where(whereClause)
      .orderBy(...orderSpecs, asc(product.productId))
      .offset((page - 1) * size)
      .limit(size);

    return result;
  }

  async findProductsByRecommended(conn: DbOrTx) {
    const { product, majorCategory, minerCategory } = schema;

    const query = this.findAllProducts(conn);

    const result = await query
      .where(and(eq(product.isValid, true), eq(product.isRecommended, true)))
      .orderBy(majorCategory.sortKey, minerCategory.sortKey, product.productId);

    return result ?? undefined;
  }

  async countProducts(conn: DbOrTx) {
    return conn.$count(schema.product);
  }

  async createProduct(
    conn: DbOrTx,
    minerCategoryId: bigint,
    productName: string,
    productComments: string | null,
    price: bigint,
    discountedRate: bigint,
  ) {
    const { product } = schema;

    return conn
      .insert(product)
      .values({
        minerCategoryId,
        productName,
        productComments,
        price,
        discountedRate,
      })
      .returning({ productId: product.productId });
  }

  async createProductImage(
    conn: DbOrTx,
    productImageId: bigint,
    fileName: string,
    originalName: string,
    mimeType: string,
    fileSize: bigint,
  ) {
    const { productImage } = schema;

    return conn
      .insert(productImage)
      .values({ productImageId, fileName, originalName, mimeType, fileSize })
      .returning({ productImageId: productImage.productImageId });
  }
}
