import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class ProductRepository {
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
    const { product, minerCategory, majorCategory } = schema;
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

    const result = await conn
      .select({
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
      })
      .from(product)
      .where(and(eq(product.isValid, true), eq(product.isRecommended, true)))
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
      )
      .orderBy(majorCategory.sortKey);

    return result ?? undefined;
  }
}
