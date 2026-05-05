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
        eq(minerCategoryId, minerCategory.minerCategoryId),
      )
      .innerJoin(
        majorCategory,
        eq(minerCategory.majorCategoryId, majorCategory.majorCategoryId),
      );
  }

  async findProductsByRecommended(conn: DbOrTx) {
    const { product, majorCategory, minerCategory } = schema;

    const query = this.findAllProducts(conn);

    const result = await query
      .where(and(eq(product.isValid, true), eq(product.isRecommended, true)))
      .orderBy(majorCategory.sortKey, minerCategory.sortKey);

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
