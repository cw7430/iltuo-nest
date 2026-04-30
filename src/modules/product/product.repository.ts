import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

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
        eq(minerCategoryId, minerCategory.majorCategoryId),
      )
      .innerJoin(
        majorCategory,
        eq(
          majorCategory,
          eq(minerCategory.majorCategoryId, majorCategory.majorCategoryId),
        ),
      );
  }

  async findAllMajorCategories(conn: DbOrTx) {
    const { majorCategory } = schema;
    const result = await conn
      .select()
      .from(majorCategory)
      .where(eq(majorCategory.isValid, true))
      .orderBy(majorCategory.sortKey);

    return result ?? undefined;
  }

  async findAllMinerCategories(conn: DbOrTx) {
    const { minerCategory, majorCategory } = schema;
    const {
      minerCategoryId,
      majorCategoryId,
      sortKey,
      minerCategoryName,
      isValid,
      createdAt,
      updatedAt,
      deletedAt,
    } = minerCategory;

    const result = await conn
      .select({
        minerCategoryId,
        majorCategoryId,
        sortKey,
        minerCategoryName,
        isValid,
        createdAt,
        updatedAt,
        deletedAt,
      })
      .from(minerCategory)
      .where(eq(isValid, true))
      .innerJoin(
        majorCategory,
        eq(majorCategoryId, majorCategory.majorCategoryId),
      )
      .orderBy(majorCategory.sortKey, minerCategory.sortKey);

    return result ?? undefined;
  }

  async findProductsByRecommended(conn: DbOrTx) {
    const { product, majorCategory } = schema;

    const query = this.findAllProducts(conn);

    const result = await query
      .where(and(eq(product.isValid, true), eq(product.isRecommended, true)))
      .orderBy(majorCategory.sortKey);

    return result ?? undefined;
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
