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

  private productsWhereClause(
    majorCategoryId: bigint,
    minerCategoryId: bigint,
  ) {
    const { product, majorCategory } = schema;

    return minerCategoryId === 0n
      ? and(
          eq(product.isValid, true),
          eq(majorCategory.majorCategoryId, majorCategoryId),
        )
      : and(
          eq(product.isValid, true),
          eq(product.minerCategoryId, minerCategoryId),
        );
  }

  async findProducts(
    conn: DbOrTx,
    param: {
      majorCategoryId: bigint;
      minerCategoryId: bigint;
      page: number;
      size: number;
      sort:
        | 'recommended'
        | 'priceAsc'
        | 'priceDesc'
        | 'createdAsc'
        | 'createdDesc';
    },
  ) {
    const { product } = schema;

    const query = this.findAllProducts(conn);

    const whereClause = this.productsWhereClause(
      param.majorCategoryId,
      param.minerCategoryId,
    );

    const orderSpecs = this.sortProducts(param.sort);

    const result = await query
      .where(whereClause)
      .orderBy(...orderSpecs, asc(product.productId))
      .offset((param.page - 1) * param.size)
      .limit(param.size);

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

  async countProducts(
    conn: DbOrTx,
    param: { majorCategoryId: bigint; minerCategoryId: bigint },
  ) {
    const query = this.findAllProducts(conn);

    const whereClause = this.productsWhereClause(
      param.majorCategoryId,
      param.minerCategoryId,
    );

    return conn.$count(query.where(whereClause));
  }

  async findProductById(conn: DbOrTx, param: { id: bigint }) {
    const { product, productImage, minerCategory } = schema;
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
    const { majorCategoryId } = minerCategory;

    const result = await conn
      .select({
        productId,
        majorCategoryId,
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
      .where(and(eq(isValid, true), eq(productId, param.id)))
      .limit(1);

    return result[0] ?? undefined;
  }

  async findOptionsByMajorCategoryId(conn: DbOrTx, param: { id: bigint }) {
    const { option } = schema;
    const {
      optionId,
      majorCategoryId,
      sortKey,
      optionName,
      optionType,
      isValid,
      createdAt,
      updatedAt,
      deletedAt,
    } = option;

    return conn
      .select({
        optionId,
        majorCategoryId,
        sortKey,
        optionName,
        optionType,
        isValid,
        createdAt,
        updatedAt,
        deletedAt,
      })
      .from(option)
      .where(and(eq(isValid, true), eq(majorCategoryId, param.id)))
      .orderBy(asc(sortKey), asc(optionId));
  }

  async findDetailOptionsByMajorCategoryId(
    conn: DbOrTx,
    param: { id: bigint },
  ) {
    const { detailOption, option } = schema;
    const {
      detailOptionId,
      optionId,
      detailOptionName,
      optionValue,
      isValid,
      createdAt,
      updatedAt,
      deletedAt,
    } = detailOption;

    return conn
      .select({
        detailOptionId,
        optionId,
        detailOptionName,
        optionValue,
        isValid,
        createdAt,
        updatedAt,
        deletedAt,
      })
      .from(detailOption)
      .innerJoin(option, eq(optionId, option.optionId))
      .where(and(eq(isValid, true), eq(option.majorCategoryId, param.id)))
      .orderBy(asc(option.sortKey), asc(optionValue), asc(detailOptionId));
  }

  async createProduct(
    conn: DbOrTx,
    param: {
      minerCategoryId: bigint;
      productName: string;
      productComments: string | null;
      price: bigint;
      discountedRate: bigint;
    },
  ) {
    const { product } = schema;

    const {
      minerCategoryId,
      productName,
      productComments,
      price,
      discountedRate,
    } = param;

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
    param: {
      productImageId: bigint;
      fileName: string;
      originalName: string;
      mimeType: string;
      fileSize: bigint;
    },
  ) {
    const { productImage } = schema;

    const { productImageId, fileName, originalName, mimeType, fileSize } =
      param;

    return conn
      .insert(productImage)
      .values({ productImageId, fileName, originalName, mimeType, fileSize })
      .returning({ productImageId: productImage.productImageId });
  }
}
